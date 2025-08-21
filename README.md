# Exemplos de Aplicações com AWS CDK

Este repositório contém exemplos práticos de aplicações utilizando o **AWS CDK (Cloud Development Kit)**.  
O objetivo é demonstrar como modelar e provisionar infraestrutura na AWS usando código, de forma organizada e reutilizável.

## Tecnologias Utilizadas

- [AWS CDK](https://aws.amazon.com/cdk/) – Linguagem: TypeScript / Node.js

## Estrutura

Cada pasta representa um exemplo independente, com foco em diferentes serviços ou padrões de arquitetura com o CDK.

- [Notification](./notification) – Envio de notificações por Email (Brevo) e WhatsApp (Twilio) com arquitetura serverless.

- [CsvParse](./csv-parse/) - Processamento de arquivo CSV por demanda com arquitetura serverles e transformação de CSV para API podendo ser realizado CRUDs.

- [Frontend](./frontend/) - Aplicação web construída com Vite + React, responsável por permitir o upload de arquivos CSV e acompanhar o processamento dos dados. A infraestrutura é provisionada com AWS CDK, incluindo S3 para hospedagem estática e CloudFront

- [users](./users/) - Implementação do CRUD de usuários via API Gateway e Lambda

- [Infra](./infra/) - Projeto AWS CDK com recursos comuns e compartilhados para toda a arquitetura

- [Auth](./auth/) - Serviço de autenticação (login, geração, validação de tokens e refresh token) com arquitetura serverless usando API Gateway, Lambda e MongoDB

## Como Utilizar os Exemplos

Siga os passos abaixo para instalar e executar qualquer projeto CDK deste repositório:

### 1. Pré-requisitos

- Node.js instalado (recomenda-se a versão LTS)
- AWS CLI configurado com credenciais válidas
- AWS CDK instalado globalmente:
  
  ```bash
  npm install -g aws-cdk
  ```

- AWS SAM CLI instalado (para testes locais):
  
  [Instruções de instalação](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

### 2. Instalar dependências

Navegue até o diretório do exemplo desejado e instale as dependências:

```bash
cd nome-do-exemplo
npm install
```

### 3. Preparar o ambiente (Bootstrap)

Antes de fazer o primeiro deploy, execute o comando abaixo uma vez por conta/region:

```bash
cdk bootstrap
```

Esse comando cria os recursos necessários para o CDK funcionar corretamente (como bucket S3 de staging).

### 4. Gerar template CloudFormation

Use o comando abaixo para gerar o template CloudFormation que será utilizado no deploy:

```bash
cdk synth
```

Isso gerará um arquivo em `cdk.out/template.json`.

### 5. Testar localmente com SAM (opcional)

Você pode invocar uma função Lambda localmente utilizando o template gerado:

```bash
sam local invoke NomeDaFuncaoLogica \
  --template cdk.out/template.json \
  --event /eventos/evento.json
```

- Substitua `NomeDaFuncaoLogica` pelo **id lógico da função** (definido na stack CDK).
- O arquivo `evento.json` deve conter um evento de teste no formato esperado pela Lambda (ex: evento do API Gateway, SQS etc.).

Exemplo de evento de teste:

```json
{
  "key1": "value1",
  "key2": "value2"
}
```

### 6. Verificar o que será provisionado

Opcionalmente, você pode gerar um diff da stack para ver as mudanças que serão aplicadas:

```bash
cdk diff
```

### 7. Deploy da Stack

Execute o deploy da infraestrutura na sua conta AWS:

```bash
cdk deploy
```

### 8. Limpar Recursos (opcional)

Para deletar todos os recursos provisionados:

```bash
cdk destroy
```
