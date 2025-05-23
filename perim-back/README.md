# Sistema de Gerenciamento de Entregas (Django API)

Este é o backend para um sistema de gerenciamento de entregas, desenvolvido com Django e Django REST framework. Ele fornece uma API para gerenciar clientes, endereços, entregadores e entregas, além de um endpoint de estatísticas.

## Pré-requisitos

Antes de começar, certifique-se de ter o seguinte instalado em sua máquina:
* Python (versão 3.8 ou superior recomendada)
* pip (gerenciador de pacotes Python, geralmente vem com o Python)
* Git (para clonar o repositório, opcional se você tiver os arquivos de outra forma)

## Configuração do Ambiente de Desenvolvimento

Siga estes passos para configurar o projeto localmente:

1.  **Clone o Repositório (ou coloque os arquivos do projeto em uma pasta):**
    ```bash
    # Se estiver usando Git
    git clone <url_do_seu_repositorio>
    cd <nome_da_pasta_do_projeto>
    ```

2.  **Crie um Ambiente Virtual Python:**
    É altamente recomendável usar um ambiente virtual para isolar as dependências do projeto.
    ```bash
    python -m venv venv
    # ou python3 -m venv venv
    ```

3.  **Ative o Ambiente Virtual:**
    * No Linux ou macOS:
        ```bash
        source venv/bin/activate
        ```
    * No Windows (Prompt de Comando):
        ```bash
        .\venv\Scripts\activate.bat
        ```
    * No Windows (PowerShell):
        ```bash
        .\venv\Scripts\Activate.ps1
        ```
    Após a ativação, o nome do ambiente (`venv`) deve aparecer no seu prompt.

4.  **Instale as Dependências:**
    O arquivo `requirements.txt` lista todos os pacotes Python necessários para o projeto.
    ```bash
    pip install -r requirements.txt
    ```
    *Caso o arquivo `requirements.txt` ainda não exista, você precisaria instalá-los manualmente (conforme discutimos: `django`, `djangorestframework`, `drf-yasg`, `django-cors-headers`) e depois gerar o arquivo com `pip freeze > requirements.txt`.*

5.  **Navegue para dentro do supermercado_perim:**
    Dê o comando cd ./supermercado_perim, os próximos comandos deverão ser executados dentro desse diretório.

6.  **Aplique as Migrações do Banco de Dados:**
    Este comando cria as tabelas no banco de dados (SQLite por padrão) necessárias para a aplicação.
    ```bash
    python manage.py migrate
    ```

7.  **Crie um Superusuário (Opcional, mas Recomendado):**
    Isso permite que você acesse a interface de administração do Django.
    ```bash
    python manage.py createsuperuser
    ```
    Siga as instruções para definir um nome de usuário, e-mail e senha.

## Rodando o Servidor de Desenvolvimento

Após a configuração, você pode iniciar o servidor de desenvolvimento do Django:
```bash
python manage.py runserver