from django.db import models

#Create your models here.

class Drawing(models.Model):
    svg = models.TextField()
    creation_time = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=1000)
    
    class Meta:
        ordering = ('-creation_time',)
