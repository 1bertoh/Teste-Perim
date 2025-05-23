from django.db import models
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
import re

class Entregador(models.Model):
    nome = models.CharField(max_length=100, verbose_name="Nome do Entregador")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Entregador"
        verbose_name_plural = "Entregadores"
        ordering = ['nome']

    def __str__(self):
        return self.nome

class Cliente(models.Model):
    nome = models.CharField(max_length=200, verbose_name="Nome")
    cpf = models.CharField(
        max_length=14,
        unique=True,
        validators=[RegexValidator(
            regex=r'^\d{3}\.\d{3}\.\d{3}-\d{2}$',
            message='CPF deve estar no formato XXX.XXX.XXX-XX'
        )],
        verbose_name="CPF"
    )
    telefone = models.CharField(
        max_length=15,
        validators=[RegexValidator(
            regex=r'^\(\d{2}\)\s\d{4,5}-\d{4}$',
            message='Telefone deve estar no formato (XX) XXXXX-XXXX'
        )],
        verbose_name="Telefone"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} - {self.cpf}"

    def clean(self):
        super().clean()
        if not self.is_valid_cpf(self.cpf):
            raise ValidationError({'cpf': 'CPF inválido de acordo com a lógica customizada.'})

    @staticmethod
    def is_valid_cpf(cpf_value):
        cpf_cleaned = re.sub(r'[^0-9]', '', cpf_value)
        if len(cpf_cleaned) != 11:
            return False
        if cpf_cleaned == cpf_cleaned[0] * 11:
            return False
        soma = sum(int(cpf_cleaned[i]) * (10 - i) for i in range(9))
        resto = soma % 11
        digito1 = 0 if resto < 2 else 11 - resto
        soma = sum(int(cpf_cleaned[i]) * (11 - i) for i in range(10))
        resto = soma % 11
        digito2 = 0 if resto < 2 else 11 - resto
        return cpf_cleaned[-2:] == f"{digito1}{digito2}"


class Endereco(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='enderecos', verbose_name="Cliente")
    cep = models.CharField(
        max_length=9,
        validators=[RegexValidator(
            regex=r'^\d{5}-\d{3}$',
            message='CEP deve estar no formato XXXXX-XXX'
        )],
        verbose_name="CEP"
    )
    logradouro = models.CharField(max_length=200, verbose_name="Logradouro")
    numero = models.CharField(max_length=10, verbose_name="Número")
    complemento = models.CharField(max_length=100, blank=True, null=True, verbose_name="Complemento")
    bairro = models.CharField(max_length=100, verbose_name="Bairro")
    cidade = models.CharField(max_length=100, verbose_name="Cidade")
    estado = models.CharField(max_length=2, verbose_name="Estado")
    principal = models.BooleanField(default=False, verbose_name="Endereço Principal")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Endereço"
        verbose_name_plural = "Endereços"
        ordering = ['-principal', 'logradouro']
        constraints = [
            models.UniqueConstraint(fields=['cliente', 'principal'], condition=models.Q(principal=True), name='unique_principal_por_cliente_if_true')
        ]


    def __str__(self):
        complemento_str = f", {self.complemento}" if self.complemento else ""
        return f"{self.logradouro}, {self.numero}{complemento_str}, {self.bairro}, {self.cidade}/{self.estado} (CEP: {self.cep})"

    def save(self, *args, **kwargs):
        if self.principal:
            Endereco.objects.filter(cliente=self.cliente, principal=True).exclude(pk=self.pk).update(principal=False)
        
        is_new = self._state.adding
        super().save(*args, **kwargs) 

        if is_new and not self.cliente.enderecos.filter(principal=True).exclude(pk=self.pk).exists():
             if not self.principal: 
                self.principal = True
                super().save(update_fields=['principal']) 
        elif not self.cliente.enderecos.filter(principal=True).exists() and self.cliente.enderecos.exists():
            if self.cliente.enderecos.count() == 1 and self.pk == self.cliente.enderecos.first().pk:
                if not self.principal:
                    self.principal = True
                    super().save(update_fields=['principal'])


class Entrega(models.Model):
    STATUS_PENDENTE = 'pendente'
    STATUS_EM_TRANSITO = 'em_transito'
    STATUS_ENTREGUE = 'entregue'

    STATUS_CHOICES = [
        (STATUS_PENDENTE, 'Pendente'),
        (STATUS_EM_TRANSITO, 'Em Trânsito'),
        (STATUS_ENTREGUE, 'Entregue'),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='entregas', verbose_name="Cliente")
    endereco = models.ForeignKey(Endereco, on_delete=models.CASCADE, verbose_name="Endereço de Entrega")
    entregador = models.ForeignKey(
        Entregador,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='entregas_realizadas',
        verbose_name="Entregador"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDENTE,
        verbose_name="Status da Entrega"
    )

    numero_caixas = models.PositiveIntegerField(verbose_name="Número de Caixas")
    bebidas = models.BooleanField(default=False, verbose_name="Bebidas")
    frios_congelados = models.BooleanField(default=False, verbose_name="Frios/Congelados")
    vassoura_rodo = models.BooleanField(default=False, verbose_name="Vassoura/Rodo")
    outros = models.BooleanField(default=False, verbose_name="Outros")
    nome_embalador = models.CharField(max_length=100, verbose_name="Nome do Embalador")
    numero_nfce = models.CharField(max_length=20, verbose_name="Número NFCe")
    serie_nfce = models.CharField(max_length=10, verbose_name="Série NFCe")
    data_compra = models.DateField(verbose_name="Data da Compra")
    data_hora_entrega = models.DateTimeField(verbose_name="Data/Hora da Entrega")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Entrega"
        verbose_name_plural = "Entregas"
        ordering = ['-data_hora_entrega']

    def __str__(self):
        entregador_nome = f" (Entregador: {self.entregador.nome})" if self.entregador else ""
        return f"Entrega {self.id} - {self.cliente.nome} ({self.get_status_display()}) - {self.data_hora_entrega.strftime('%d/%m/%Y %H:%M')}{entregador_nome}"

    @property
    def endereco_completo_str(self):
        return str(self.endereco)

    @property
    def get_volumes_extras_list(self):
        volumes = []
        if self.bebidas: volumes.append("Bebidas")
        if self.frios_congelados: volumes.append("Frios/Congelados")
        if self.vassoura_rodo: volumes.append("Vassoura/Rodo")
        if self.outros: volumes.append("Outros")
        return volumes
