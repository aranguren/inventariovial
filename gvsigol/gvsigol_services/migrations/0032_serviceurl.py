# -*- coding: utf-8 -*-
# Generated by Django 1.11.24 on 2020-05-06 15:25
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gvsigol_services', '0031_auto_20191220_1226'),
    ]

    operations = [
        migrations.CreateModel(
            name='ServiceUrl',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(blank=True, max_length=500, null=True)),
                ('type', models.CharField(choices=[('WMS', 'WMS'), ('WMTS', 'WMTS'), ('WFS', 'WFS'), ('CSW', 'CSW')], default='WMS', max_length=50)),
                ('url', models.CharField(blank=True, max_length=500, null=True)),
            ],
        ),
    ]