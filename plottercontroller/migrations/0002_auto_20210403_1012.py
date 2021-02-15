# Generated by Django 3.1.5 on 2021-04-03 10:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plottercontroller', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='drawing',
            options={'ordering': ('-creation_time',)},
        ),
        migrations.AddField(
            model_name='drawing',
            name='location',
            field=models.CharField(default='', max_length=1000),
            preserve_default=False,
        ),
    ]
