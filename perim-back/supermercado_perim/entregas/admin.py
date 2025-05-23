# entregas/admin.py
from django.contrib import admin
from .models import Cliente, Endereco, Entrega, Entregador

class EnderecoInline(admin.TabularInline):
    model = Endereco
    fields = ('cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'principal')
    extra = 1

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cpf', 'telefone', 'get_endereco_principal_display', 'created_at')
    list_filter = ('created_at', 'enderecos__cidade', 'enderecos__estado')
    search_fields = ('nome', 'cpf', 'telefone')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [EnderecoInline]

    fieldsets = (
        ('Informações Pessoais', {
            'fields': ('nome', 'cpf', 'telefone')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def get_endereco_principal_display(self, obj):
        principal = obj.enderecos.filter(principal=True).first()
        return str(principal) if principal else "Nenhum endereço principal"
    get_endereco_principal_display.short_description = "Endereço Principal"


@admin.register(Endereco)
class EnderecoAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'logradouro_completo', 'principal', 'cidade', 'estado')
    list_filter = ('cidade', 'estado', 'principal', 'cliente__nome')
    search_fields = ('cep', 'logradouro', 'bairro', 'cliente__nome', 'cliente__cpf')
    autocomplete_fields = ['cliente']
    list_select_related = ('cliente',)

    def logradouro_completo(self, obj):
        return str(obj)
    logradouro_completo.short_description = "Endereço Completo"

@admin.register(Entregador)
class EntregadorAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome', 'created_at', 'updated_at')
    search_fields = ('nome',)
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('nome',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

@admin.register(Entrega)
class EntregaAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_cliente_nome', 'status', 'get_entregador_nome', 'get_endereco_resumido', 'data_hora_entrega', 'numero_caixas') 
    list_filter = ('status', 'data_hora_entrega', 'entregador', 'bebidas', 'frios_congelados', 'vassoura_rodo', 'outros', 'cliente__nome', 'endereco__cidade')
    search_fields = ('cliente__nome', 'cliente__cpf', 'entregador__nome', 'status', 'numero_nfce', 'nome_embalador', 'endereco__logradouro', 'endereco__cep')
    readonly_fields = ('created_at', 'updated_at', 'get_volumes_extras_list_display')
    date_hierarchy = 'data_hora_entrega'
    autocomplete_fields = ['cliente', 'endereco', 'entregador']

    fieldsets = (
        (None, {
            'fields': ('cliente', 'endereco', 'entregador', 'status')
        }),
        ('Detalhes da Entrega', {
            'fields': ('data_hora_entrega', 'data_compra', 'numero_caixas', 'nome_embalador', 'numero_nfce', 'serie_nfce')
        }),
        ('Volumes Extras', {
            'fields': ('bebidas', 'frios_congelados', 'vassoura_rodo', 'outros', 'get_volumes_extras_list_display')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def get_cliente_nome(self, obj):
        return obj.cliente.nome
    get_cliente_nome.short_description = 'Cliente'
    get_cliente_nome.admin_order_field = 'cliente__nome'

    def get_entregador_nome(self, obj):
        return obj.entregador.nome if obj.entregador else "N/A"
    get_entregador_nome.short_description = 'Entregador'
    get_entregador_nome.admin_order_field = 'entregador__nome'

    def get_endereco_resumido(self, obj):
        if obj.endereco:
            return f"{obj.endereco.logradouro}, {obj.endereco.numero} - {obj.endereco.bairro}"
        return "N/A"
    get_endereco_resumido.short_description = 'Endereço'
    get_endereco_resumido.admin_order_field = 'endereco__logradouro'

    def get_volumes_extras_list_display(self, obj):
        return ", ".join(obj.get_volumes_extras_list) if obj.get_volumes_extras_list else "Nenhum"
    get_volumes_extras_list_display.short_description = 'Lista de Volumes Extras'

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "endereco":
            pass
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
