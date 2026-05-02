from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Question, Answer, Score, GiftSuggestion, UserProfile
from .serializers import (RegisterSerializer, UserSerializer, QuestionSerializer,
                          AnswerInputSerializer, ScoreSerializer, GiftSuggestionSerializer,
                          UserProfileSerializer)

ADVICE_MAP = {
    'Trust': "Work on building trust by being consistent, transparent, and keeping your promises. Share your feelings openly.",
    'Communication': "Practice active listening and express yourself clearly. Schedule daily check-ins with your partner.",
    'Emotional Safety': "Create a judgment-free space. Validate each other's feelings and avoid dismissive language.",
    'Effort': "Show effort through small daily gestures. Surprise your partner with acts of love and appreciation.",
    'Support': "Be your partner's cheerleader. Ask how you can help and be present during difficult times.",
    'Toxic': "Consider professional relationship counseling. Identify and address unhealthy behavior patterns together.",
}

def compute_score(answers_data):
    questions = {q.id: q for q in Question.objects.all()}
    category_totals = {}
    category_counts = {}
    total = 0

    for item in answers_data:
        q = questions.get(item['question_id'])
        if not q:
            continue
        val = item['answer_value']
        if q.is_toxic:
            val = 10 - val  # reverse scoring: Always(10)->0, Never(0)->10
        total += val
        cat = q.category
        category_totals[cat] = category_totals.get(cat, 0) + val
        category_counts[cat] = category_counts.get(cat, 0) + 1

    category_scores = {}
    advice = []
    for cat in category_totals:
        avg = round(category_totals[cat] / category_counts[cat], 1)
        category_scores[cat] = avg
        if avg < 5:
            advice.append({'category': cat, 'text': ADVICE_MAP.get(cat, '')})

    if total >= 180:
        status_label = 'Healthy'
    elif total >= 100:
        status_label = 'Needs Improvement'
    else:
        status_label = 'Toxic Warning'

    return total, category_scores, status_label, advice

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_questions(request):
    questions = Question.objects.all().order_by('category', 'id')
    return Response(QuestionSerializer(questions, many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_answers(request):
    answers_data = request.data.get('answers', [])
    if not answers_data:
        return Response({'error': 'No answers provided'}, status=status.HTTP_400_BAD_REQUEST)

    Answer.objects.filter(user=request.user).delete()
    for item in answers_data:
        try:
            q = Question.objects.get(id=item['question_id'])
            Answer.objects.create(user=request.user, question=q, answer_value=item['answer_value'])
        except Question.DoesNotExist:
            pass

    total, category_scores, status_label, advice = compute_score(answers_data)
    score = Score.objects.create(
        user=request.user,
        total_score=total,
        category_scores={'scores': category_scores, 'advice': advice},
        status=status_label,
    )

    gifts = GiftSuggestion.objects.filter(category=status_label) or GiftSuggestion.objects.all()[:3]
    return Response({
        'score': ScoreSerializer(score).data,
        'advice': advice,
        'gifts': GiftSuggestionSerializer(gifts[:4], many=True).data,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_results(request):
    score = Score.objects.filter(user=request.user).order_by('-created_at').first()
    if not score:
        return Response({'error': 'No results found'}, status=status.HTTP_404_NOT_FOUND)
    gifts = GiftSuggestion.objects.filter(category=score.status)[:4]
    advice = score.category_scores.get('advice', [])
    return Response({
        'score': ScoreSerializer(score).data,
        'advice': advice,
        'gifts': GiftSuggestionSerializer(gifts, many=True).data,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_history(request):
    scores = Score.objects.filter(user=request.user).order_by('-created_at')[:10]
    return Response(ScoreSerializer(scores, many=True).data)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    if request.method == 'GET':
        return Response(UserSerializer(user).data)
    
    profile_obj, _ = UserProfile.objects.get_or_create(user=user)
    data = request.data
    if 'partner_name' in data:
        profile_obj.partner_name = data['partner_name']
    if 'anniversary_date' in data:
        profile_obj.anniversary_date = data['anniversary_date'] or None
    if 'mood_today' in data:
        profile_obj.mood_today = data['mood_today']
        profile_obj.mood_updated_at = timezone.now()
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    user.save()
    profile_obj.save()
    return Response(UserSerializer(user).data)
