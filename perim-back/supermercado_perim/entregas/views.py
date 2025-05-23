from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import render, get_object_or_404
from django.db.models import Q, Count
from django.utils.dateparse import parse_date
from django.utils import timezone
from datetime import timedelta, date

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Cliente, Endereco, Entrega, Entregador
from .serializers import (
    ClienteSerializer, ClienteCreateUpdateSerializer,
    EnderecoSerializer,
    EntregaSerializer, EntregaCreateUpdateSerializer,
    EntregadorSerializer
)

def index(request):
    return render(request, 'index.html')

class ClienteListCreateView(generics.ListCreateAPIView):
    queryset = Cliente.objects.prefetch_related('enderecos').all().order_by('nome')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ClienteCreateUpdateSerializer
        return ClienteSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)
        nome_param = self.request.query_params.get('nome', None) 

        if nome_param:
            queryset = queryset.filter(nome__icontains=nome_param)
        elif search_term:
            queryset = queryset.filter(
                Q(nome__icontains=search_term) |
                Q(cpf__icontains=search_term) |
                Q(telefone__icontains=search_term)
            )
        return queryset

class ClienteRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cliente.objects.prefetch_related('enderecos').all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ClienteCreateUpdateSerializer
        return ClienteSerializer

class EnderecoListCreateView(generics.ListCreateAPIView):
    serializer_class = EnderecoSerializer
    
    def get_queryset(self):
        cliente_pk = self.kwargs['cliente_pk']
        get_object_or_404(Cliente, pk=cliente_pk)
        return Endereco.objects.filter(cliente_id=cliente_pk).order_by('-principal', 'logradouro')

    def perform_create(self, serializer):
        cliente_pk = self.kwargs['cliente_pk']
        cliente = get_object_or_404(Cliente, pk=cliente_pk)
        serializer.save(cliente=cliente)

class EnderecoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EnderecoSerializer
    
    def get_queryset(self):
        cliente_pk = self.kwargs['cliente_pk']
        return Endereco.objects.filter(cliente_id=cliente_pk)

class EntregadorListCreateView(generics.ListCreateAPIView):
    queryset = Entregador.objects.all().order_by('nome')
    serializer_class = EntregadorSerializer

class EntregadorRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Entregador.objects.all()
    serializer_class = EntregadorSerializer

class EntregaListCreateView(generics.ListCreateAPIView):
    queryset = Entrega.objects.select_related('cliente', 'endereco', 'entregador').all().order_by('-data_hora_entrega')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EntregaCreateUpdateSerializer
        return EntregaSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset = super().get_queryset()
        cliente_id_param = self.request.query_params.get('cliente', None)
        entregador_id_param = self.request.query_params.get('entregador', None)
        data_inicio = self.request.query_params.get('data_inicio', None)
        data_fim = self.request.query_params.get('data_fim', None)
        search = self.request.query_params.get('search', None)
        status_param = self.request.query_params.get('status', None)

        if cliente_id_param:
            queryset = queryset.filter(cliente_id=cliente_id_param)
        if entregador_id_param:
            queryset = queryset.filter(entregador_id=entregador_id_param)
        if data_inicio:
            data_inicio_parsed = parse_date(data_inicio)
            if data_inicio_parsed:
                queryset = queryset.filter(data_hora_entrega__date__gte=data_inicio_parsed)
        if data_fim:
            data_fim_parsed = parse_date(data_fim)
            if data_fim_parsed:
                queryset = queryset.filter(data_hora_entrega__date__lte=data_fim_parsed)
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        if search:
            queryset = queryset.filter(
                Q(cliente__nome__icontains=search) |
                Q(entregador__nome__icontains=search) |
                Q(status__icontains=search) | 
                Q(numero_nfce__icontains=search) |
                Q(nome_embalador__icontains=search) |
                Q(endereco__logradouro__icontains=search) |
                Q(endereco__bairro__icontains=search) |
                Q(endereco__cep__icontains=search)
            )
        return queryset

class EntregaRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Entrega.objects.select_related('cliente', 'endereco', 'entregador').all()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EntregaCreateUpdateSerializer
        return EntregaSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

@api_view(['GET'])
def cliente_entregas(request, cliente_id):
    cliente = get_object_or_404(Cliente.objects.prefetch_related('enderecos', 'entregas__endereco', 'entregas__entregador'), pk=cliente_id)
    cliente_data = ClienteSerializer(cliente, context={'request': request}).data
    entregas_data = EntregaSerializer(cliente.entregas.all(), many=True, context={'request': request}).data
    return Response({
        'cliente': cliente_data,
        'entregas_do_cliente': entregas_data
    })

@swagger_auto_schema(method='get', tags=['Utilitários'], operation_summary="Obter estatísticas gerais do sistema.")
@api_view(['GET'])
def estatisticas(request):
    total_clientes = Cliente.objects.count()
    total_entregas = Entrega.objects.count()
    total_enderecos = Endereco.objects.count()
    total_entregadores = Entregador.objects.count()

    seis_meses_atras = timezone.now() - timedelta(days=180) 
    entregas_por_mes_query = (
        Entrega.objects
        .filter(data_hora_entrega__gte=seis_meses_atras)
        .extra({'mes': "strftime('%%Y-%%m', data_hora_entrega)"})
        .values('mes')
        .annotate(total=Count('id'))
        .order_by('mes')
    )
    entregas_por_mes_list = list(entregas_por_mes_query)


    top_clientes_entregas_query = (
        Cliente.objects
        .annotate(num_entregas=Count('entregas'))
        .filter(num_entregas__gt=0)
        .order_by('-num_entregas')[:5]
    )
    top_clientes_list = [
        {'id': cliente.id, 'nome': cliente.nome, 'total_entregas': cliente.num_entregas}
        for cliente in top_clientes_entregas_query
    ]

    hoje = timezone.now().date()
    entregador_do_dia_obj = Entregador.objects.filter(
        entregas_realizadas__data_hora_entrega__date=hoje
    ).annotate(
        num_entregas_hoje=Count('entregas_realizadas', filter=Q(entregas_realizadas__data_hora_entrega__date=hoje))
    ).order_by('-num_entregas_hoje').first()

    entregador_do_dia_info = {
        'id': None,
        'nome': "Nenhum entregador com entregas hoje",
        'total_entregas_hoje': 0
    }
    if entregador_do_dia_obj and entregador_do_dia_obj.num_entregas_hoje > 0:
        entregador_do_dia_info = {
            'id': entregador_do_dia_obj.id,
            'nome': entregador_do_dia_obj.nome,
            'total_entregas_hoje': entregador_do_dia_obj.num_entregas_hoje
        }

    distribuicao_status_query = (
        Entrega.objects
        .values('status')
        .annotate(total=Count('id'))
        .order_by('status')
    )
    distribuicao_status_list = list(distribuicao_status_query)


    return Response({
        'total_clientes': total_clientes,
        'total_entregas': total_entregas,
        'total_enderecos': total_enderecos,
        'total_entregadores': total_entregadores,
        'entregas_por_mes': entregas_por_mes_list,
        'top_clientes_com_mais_entregas': top_clientes_list,
        'entregador_do_dia': entregador_do_dia_info,
        'distribuicao_status_entregas': distribuicao_status_list 
    })

@api_view(['POST'])
def buscar_cep(request):
    import requests
    cep_raw = request.data.get('cep', '')
    cep = cep_raw.replace('-', '').replace('.', '')
    if not cep or len(cep) != 8 or not cep.isdigit():
        return Response(
            {'erro': 'CEP deve ter 8 dígitos numéricos.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    try:
        response = requests.get(f'https://viacep.com.br/ws/{cep}/json/')
        response.raise_for_status()
        data = response.json()
        if data.get('erro'):
            return Response(
                {'erro': 'CEP não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response({
            'cep': data.get('cep', ''),
            'logradouro': data.get('logradouro', ''),
            'complemento': data.get('complemento', ''),
            'bairro': data.get('bairro', ''),
            'cidade': data.get('localidade', ''),
            'estado': data.get('uf', '')
        })
    except requests.Timeout:
        return Response(
            {'erro': 'Timeout ao consultar o serviço de CEP.'},
            status=status.HTTP_504_GATEWAY_TIMEOUT
        )
    except requests.RequestException:
        return Response(
            {'erro': 'Erro ao consultar o serviço de CEP.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
