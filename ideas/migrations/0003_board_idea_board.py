import django.db.models.deletion
from django.db import migrations, models


def create_default_board(apps, schema_editor):
    Board = apps.get_model('ideas', 'Board')
    Idea = apps.get_model('ideas', 'Idea')
    if Idea.objects.exists():
        default_board = Board.objects.create(name='Tablero 1')
        Idea.objects.update(board=default_board)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('ideas', '0002_idea_height_idea_width'),
    ]

    operations = [
        migrations.CreateModel(
            name='Board',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddField(
            model_name='idea',
            name='board',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='ideas', to='ideas.board'),
        ),
        migrations.RunPython(create_default_board, noop),
        migrations.AlterField(
            model_name='idea',
            name='board',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ideas', to='ideas.board'),
        ),
    ]
