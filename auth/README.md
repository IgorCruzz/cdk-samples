🔐 Auth Service – Autenticação Serverless com MongoDB
Esta aplicação serverless fornece um serviço de autenticação.

🛠️ Arquitetura
<p align="center"> <img src="https://github.com/IgorCruzz/cdk-samples/blob/main/_diagrams/auth-service.png" alt="Arquitetura Auth Service" /> </p>

🚀 Principais Funcionalidades

🔑 Login com autenticação baseada em JWT

🔄 Refresh Token para renovação de sessões

📦 Tecnologias & Serviços
Amazon API Gateway – Endpoint público para as rotas de autenticação

AWS Lambda – Funções serverless responsáveis por: 

Login e geração de tokens

Validação de tokens

MongoDB – Banco NoSQL para persistência de dados de usuários e sessões

AWS CDK – Infraestrutura como código (IaC)