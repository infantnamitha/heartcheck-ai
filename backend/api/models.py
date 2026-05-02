from django.db import models
from django.contrib.auth.models import User

class Question(models.Model):
    CATEGORY_CHOICES = [
        ('Trust', 'Trust'),
        ('Communication', 'Communication'),
        ('Emotional Safety', 'Emotional Safety'),
        ('Effort', 'Effort'),
        ('Support', 'Support'),
        ('Toxic', 'Toxic'),
    ]
    text = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    is_toxic = models.BooleanField(default=False)

    def __str__(self):
        return self.text[:60]

class Answer(models.Model):
    ANSWER_CHOICES = [(10, 'Always'), (5, 'Sometimes'), (0, 'Never')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer_value = models.IntegerField(choices=ANSWER_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

class Score(models.Model):
    STATUS_CHOICES = [
        ('Healthy', 'Healthy'),
        ('Needs Improvement', 'Needs Improvement'),
        ('Toxic Warning', 'Toxic Warning'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scores')
    total_score = models.IntegerField()
    category_scores = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

class GiftSuggestion(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, default='General')

    def __str__(self):
        return self.title

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    partner_name = models.CharField(max_length=100, blank=True)
    anniversary_date = models.DateField(null=True, blank=True)
    mood_today = models.CharField(max_length=50, blank=True)
    mood_updated_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s profile"
