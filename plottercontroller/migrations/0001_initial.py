# Generated by Django 3.1.5 on 2021-03-26 10:53

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Drawing',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('svg', models.TextField()),
                ('creation_time', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
