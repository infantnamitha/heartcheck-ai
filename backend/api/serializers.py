from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Question, Answer, Score, GiftSuggestion, UserProfile

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        UserProfile.objects.create(user=user)
        return user

class UserSerializer(serializers.ModelSerializer):
    partner_name = serializers.SerializerMethodField()
    anniversary_date = serializers.SerializerMethodField()
    mood_today = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'partner_name', 'anniversary_date', 'mood_today']

    def get_partner_name(self, obj):
        try: return obj.profile.partner_name
        except: return ''

    def get_anniversary_date(self, obj):
        try: return obj.profile.anniversary_date
        except: return None

    def get_mood_today(self, obj):
        try: return obj.profile.mood_today
        except: return ''

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'category', 'is_toxic']

class AnswerInputSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    answer_value = serializers.ChoiceField(choices=[0, 5, 10])

class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Score
        fields = ['id', 'total_score', 'category_scores', 'status', 'created_at']

class GiftSuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftSuggestion
        fields = ['id', 'title', 'description', 'category']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['partner_name', 'anniversary_date', 'mood_today']
