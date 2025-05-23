from rest_framework import serializers
from .models import Cliente, Endereco, Entrega, Entregador

class EntregadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entregador
        fields = ['id', 'nome', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class EnderecoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Endereco
        fields = ['id', 'cep', 'logradouro', 'numero', 'complemento',
                  'bairro', 'cidade', 'estado', 'principal', 'cliente']
        read_only_fields = ['id']
        extra_kwargs = {
            'cliente': {'read_only': True}
        }

class ClienteSerializer(serializers.ModelSerializer):
    enderecos = EnderecoSerializer(many=True, read_only=True)
    endereco_principal = serializers.SerializerMethodField()

    class Meta:
        model = Cliente
        fields = ['id', 'nome', 'cpf', 'telefone', 'enderecos', 'endereco_principal',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'enderecos', 'endereco_principal']

    def get_endereco_principal(self, obj):
        endereco = obj.enderecos.filter(principal=True).first()
        if endereco:
            return EnderecoSerializer(endereco, context=self.context).data
        return None

class ClienteCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'nome', 'cpf', 'telefone']
        read_only_fields = ['id']

    def validate_cpf(self, value):
        instance = getattr(self, 'instance', None)
        if instance and instance.cpf == value:
            return value
        if Cliente.objects.filter(cpf=value).exists():
            raise serializers.ValidationError("Este CPF já está cadastrado.")
        if not Cliente.is_valid_cpf(value):
            raise serializers.ValidationError("CPF inválido.")
        return value

class EntregaSerializer(serializers.ModelSerializer):
    cliente_nome = serializers.CharField(source='cliente.nome', read_only=True)
    endereco_detalhes = EnderecoSerializer(source='endereco', read_only=True)
    volumes_extras_list = serializers.ListField(source='get_volumes_extras_list', read_only=True)
    entregador = EntregadorSerializer(read_only=True)
    entregador_id = serializers.PrimaryKeyRelatedField(
        queryset=Entregador.objects.all(),
        source='entregador',
        write_only=True,
        allow_null=True,
        required=False
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)


    class Meta:
        model = Entrega
        fields = [
            'id', 'cliente', 'cliente_nome',
            'endereco', 'endereco_detalhes',
            'entregador', 'entregador_id',
            'status', 'status_display',
            'numero_caixas', 'bebidas', 'frios_congelados',
            'vassoura_rodo', 'outros', 'volumes_extras_list', 'nome_embalador',
            'numero_nfce', 'serie_nfce', 'data_compra', 'data_hora_entrega',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'cliente_nome', 'endereco_detalhes', 'volumes_extras_list', 'entregador', 'status_display']

class EntregaCreateUpdateSerializer(serializers.ModelSerializer):
    cliente = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all())
    endereco = serializers.PrimaryKeyRelatedField(queryset=Endereco.objects.all())
    entregador = serializers.PrimaryKeyRelatedField(
        queryset=Entregador.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model = Entrega
        fields = [
            'cliente', 'endereco', 'entregador', 'status',
            'numero_caixas',
            'bebidas', 'frios_congelados', 'vassoura_rodo', 'outros',
            'nome_embalador', 'numero_nfce', 'serie_nfce',
            'data_compra', 'data_hora_entrega'
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request', None)
        cliente_id = None

        if request and request.method in ['PUT', 'PATCH']:
            if self.instance:
                cliente_id = self.instance.cliente_id
        elif 'initial' in kwargs:
            cliente_id = kwargs['initial'].get('cliente')
        elif 'data' in kwargs:
            data = kwargs.get('data')
            if data:
                 cliente_id = data.get('cliente')


        if cliente_id:
            try:
                cliente_pk = int(cliente_id)
                self.fields['endereco'].queryset = Endereco.objects.filter(cliente_id=cliente_pk)
            except (ValueError, TypeError):
                self.fields['endereco'].queryset = Endereco.objects.none()

    def validate(self, data):
        cliente = data.get('cliente')
        endereco = data.get('endereco')

        if cliente and endereco:
            if endereco.cliente != cliente:
                raise serializers.ValidationError(
                    {'endereco': 'Este endereço não pertence ao cliente selecionado.'}
                )
        return data
