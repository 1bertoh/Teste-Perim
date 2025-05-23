# entregas/urls.py
from django.urls import path
from . import views

app_name = 'entregas'

urlpatterns = [
    # Frontend
    path('', views.index, name='index'),

    # --- API Clientes ---
    path('api/clientes/', views.ClienteListCreateView.as_view(), name='cliente-list-create'),
    path('api/clientes/<int:pk>/', views.ClienteRetrieveUpdateDestroyView.as_view(), name='cliente-detail'),

    # --- API Endereços (Aninhada sob Clientes) ---
    path('api/clientes/<int:cliente_pk>/enderecos/', views.EnderecoListCreateView.as_view(), name='endereco-list-create'),
    path('api/clientes/<int:cliente_pk>/enderecos/<int:pk>/', views.EnderecoRetrieveUpdateDestroyView.as_view(), name='endereco-detail'),

    # --- API Entregadores --- (Novas URLs para Entregador)
    path('api/entregadores/', views.EntregadorListCreateView.as_view(), name='entregador-list-create'),
    path('api/entregadores/<int:pk>/', views.EntregadorRetrieveUpdateDestroyView.as_view(), name='entregador-detail'),

    # --- API Entregas ---
    path('api/entregas/', views.EntregaListCreateView.as_view(), name='entrega-list-create'),
    path('api/entregas/<int:pk>/', views.EntregaRetrieveUpdateDestroyView.as_view(), name='entrega-detail'),

    # --- API Views Customizadas ---
    path('api/clientes/<int:cliente_id>/lista-entregas/', views.cliente_entregas, name='cliente-entregas-custom-list'),

    # API Utilitários
    path('api/buscar-cep/', views.buscar_cep, name='buscar-cep'),
    path('api/estatisticas/', views.estatisticas, name='estatisticas'),
]
