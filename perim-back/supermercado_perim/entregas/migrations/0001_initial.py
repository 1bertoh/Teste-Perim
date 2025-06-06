# Generated by Django 5.2.1 on 2025-05-22 14:58

import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Cliente',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=200, verbose_name='Nome')),
                ('cpf', models.CharField(max_length=14, unique=True, validators=[django.core.validators.RegexValidator(message='CPF deve estar no formato XXX.XXX.XXX-XX', regex='^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$')], verbose_name='CPF')),
                ('telefone', models.CharField(max_length=15, validators=[django.core.validators.RegexValidator(message='Telefone deve estar no formato (XX) XXXXX-XXXX', regex='^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$')], verbose_name='Telefone')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Cliente',
                'verbose_name_plural': 'Clientes',
                'ordering': ['nome'],
            },
        ),
        migrations.CreateModel(
            name='Endereco',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cep', models.CharField(max_length=9, validators=[django.core.validators.RegexValidator(message='CEP deve estar no formato XXXXX-XXX', regex='^\\d{5}-\\d{3}$')], verbose_name='CEP')),
                ('logradouro', models.CharField(max_length=200, verbose_name='Logradouro')),
                ('numero', models.CharField(max_length=10, verbose_name='Número')),
                ('complemento', models.CharField(blank=True, max_length=100, null=True, verbose_name='Complemento')),
                ('bairro', models.CharField(max_length=100, verbose_name='Bairro')),
                ('cidade', models.CharField(max_length=100, verbose_name='Cidade')),
                ('estado', models.CharField(max_length=2, verbose_name='Estado')),
                ('principal', models.BooleanField(default=False, verbose_name='Endereço Principal')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('cliente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='enderecos', to='entregas.cliente', verbose_name='Cliente')),
            ],
            options={
                'verbose_name': 'Endereço',
                'verbose_name_plural': 'Endereços',
                'ordering': ['-principal', 'logradouro'],
            },
        ),
        migrations.CreateModel(
            name='Entrega',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('numero_caixas', models.PositiveIntegerField(verbose_name='Número de Caixas')),
                ('bebidas', models.BooleanField(default=False, verbose_name='Bebidas')),
                ('frios_congelados', models.BooleanField(default=False, verbose_name='Frios/Congelados')),
                ('vassoura_rodo', models.BooleanField(default=False, verbose_name='Vassoura/Rodo')),
                ('outros', models.BooleanField(default=False, verbose_name='Outros')),
                ('nome_embalador', models.CharField(max_length=100, verbose_name='Nome do Embalador')),
                ('numero_nfce', models.CharField(max_length=20, verbose_name='Número NFCe')),
                ('serie_nfce', models.CharField(max_length=10, verbose_name='Série NFCe')),
                ('data_compra', models.DateField(verbose_name='Data da Compra')),
                ('data_hora_entrega', models.DateTimeField(verbose_name='Data/Hora da Entrega')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('cliente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='entregas', to='entregas.cliente', verbose_name='Cliente')),
                ('endereco', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='entregas.endereco', verbose_name='Endereço de Entrega')),
            ],
            options={
                'verbose_name': 'Entrega',
                'verbose_name_plural': 'Entregas',
                'ordering': ['-data_hora_entrega'],
            },
        ),
        migrations.AddConstraint(
            model_name='endereco',
            constraint=models.UniqueConstraint(condition=models.Q(('principal', True)), fields=('cliente', 'principal'), name='unique_principal_por_cliente_if_true'),
        ),
    ]
