from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.utils import timezone
from datetime import date
from .models import Cliente, Entrega

class ClienteModelTest(TestCase):
    def setUp(self):
        self.cliente_data = {
            'nome': 'João Silva',
            'cpf': '123.456.789-01',
            'telefone': '(11) 99999-9999',
            'cep': '01234-567',
            'logradouro': 'Rua das Flores',
            'numero': '123',
            'bairro': 'Centro',
            'cidade': 'São Paulo',
            'estado': 'SP'
        }
    
    def test_criar_cliente(self):
        cliente = Cliente.objects.create(**self.cliente_data)
        self.assertEqual(cliente.nome, 'João Silva')
        self.assertEqual(cliente.cpf, '123.456.789-01')
        self.assertEqual(str(cliente), 'João Silva - 123.456.789-01')
    
    def test_validacao_cpf_valido(self):
        # CPF válido
        self.assertTrue(Cliente.is_valid_cpf('11144477735'))
        self.assertTrue(Cliente.is_valid_cpf('111.444.777-35'))
    
    def test_validacao_cpf_invalido(self):
        # CPF inválido
        self.assertFalse(Cliente.is_valid_cpf('11111111111'))
        self.assertFalse(Cliente.is_valid_cpf('123.456.789-00'))
        self.assertFalse(Cliente.is_valid_cpf('12345'))

class EntregaModelTest(TestCase):
    def setUp(self):
        self.cliente = Cliente.objects.create(
            nome='Maria Santos',
            cpf='111.444.777-35',
            telefone='(11) 88888-8888',
            cep='01234-567',
            logradouro='Av. Principal',
            numero='456',
            bairro='Vila Nova',
            cidade='São Paulo',
            estado='SP'
        )
        
        self.entrega_data = {
            'cliente': self.cliente,
            'endereco_cep': '01234-567',
            'endereco_logradouro': 'Av. Principal',
            'endereco_numero': '456',
            'endereco_bairro': 'Vila Nova',
            'endereco_cidade': 'São Paulo',
            'endereco_estado': 'SP',
            'numero_caixas': 3,
            'bebidas': True,
            'frios_congelados': False,
            'vassoura_rodo': False,
            'outros': True,
            'nome_embalador': 'Carlos',
            'numero_nfce': '12345',
            'serie_nfce': '1',
            'data_compra': date.today(),
            'data_hora_entrega': timezone.now()
        }
    
    def test_criar_entrega(self):
        entrega = Entrega.objects.create(**self.entrega_data)
        self.assertEqual(entrega.cliente, self.cliente)
        self.assertEqual(entrega.numero_caixas, 3)
        self.assertTrue(entrega.bebidas)
        self.assertTrue(entrega.outros)
    
    def test_endereco_completo(self):
        entrega = Entrega.objects.create(**self.entrega_data)
        endereco_esperado = "Av. Principal, 456, Vila Nova, São Paulo/SP, 01234-567"
        self.assertEqual(entrega.endereco_completo, endereco_esperado)
    
    def test_volumes_extras_list(self):
        entrega = Entrega.objects.create(**self.entrega_data)
        volumes_esperados = ['Bebidas', 'Outros']
        self.assertEqual(entrega.volumes_extras_list, volumes_esperados)

class ClienteAPITest(APITestCase):
    def setUp(self):
        self.cliente_data = {
            'nome': 'Ana Costa',
            'cpf': '111.444.777-35',
            'telefone': '(11) 77777-7777',
            'endereco': {
                'cep': '01234-567',
                'logradouro': 'Rua Nova',
                'numero': '789',
                'bairro': 'Jardim',
                'cidade': 'São Paulo',
                'estado': 'SP'
            }
        }
    
    def test_criar_cliente_api(self):
        url = reverse('entregas:cliente-list-create')
        response = self.client.post(url, self.cliente_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Cliente.objects.count(), 1)
        self.assertEqual(Cliente.objects.get().nome, 'Ana Costa')
    
    def test_listar_clientes_api(self):
        Cliente.objects.create(
            nome='Teste Cliente',
            cpf='111.444.777-35',
            telefone='(11) 99999-9999',
            cep='01234-567',
            logradouro='Rua Teste',
            numero='123',
            bairro='Teste',
            cidade='São Paulo',
            estado='SP'
        )
        
        url = reverse('entregas:cliente-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

class EntregaAPITest(APITestCase):
    def setUp(self):
        self.cliente = Cliente.objects.create(
            nome='Pedro Lima',
            cpf='111.444.777-35',
            telefone='(11) 66666-6666',
            cep='01234-567',
            logradouro='Rua Lima',
            numero='321',
            bairro='Alto',
            cidade='São Paulo',
            estado='SP'
        )
        
        self.entrega_data = {
            'cliente': self.cliente.id,
            'endereco': {
                'cep': '01234-567',
                'logradouro': 'Rua Lima',
                'numero': '321',
                'bairro': 'Alto',
                'cidade': 'São Paulo',
                'estado': 'SP'
            },
            'numeroCaixas': 2,
            'volumesExtras': {
                'bebidas': True,
                'friosCongelados': False,
                'vassouraRodo': True,
                'outros': False
            },
            'nomeEmbalador': 'Roberto',
            'numeroNFCe': '54321',
            'serieNFCe': '2',
            'dataCompra': '2024-01-15',
            'dataHoraEntrega': timezone.now().isoformat()
        }
    
    def test_criar_entrega_api(self):
        url = reverse('entregas:entrega-list-create')
        response = self.client.post(url, self.entrega_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Entrega.objects.count(), 1)
        
        entrega = Entrega.objects.get()
        self.assertEqual(entrega.cliente, self.cliente)
        self.assertEqual(entrega.numero_caixas, 2)
        self.assertTrue(entrega.bebidas)
        self.assertTrue(entrega.vassoura_rodo)
    
    def test_listar_entregas_api(self):
        Entrega.objects.create(
            cliente=self.cliente,
            endereco_cep='01234-567',
            endereco_logradouro='Rua Lima',
            endereco_numero='321',
            endereco_bairro='Alto',
            endereco_cidade='São Paulo',
            endereco_estado='SP',
            numero_caixas=1,
            nome_embalador='Teste',
            numero_nfce='11111',
            serie_nfce='1',
            data_compra=date.today(),
            data_hora_entrega=timezone.now()
        )
        
        url = reverse('entregas:entrega-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)