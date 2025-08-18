👥 User Service – Gerenciamento Serverless de Usuários
Esta aplicação serverless permite o cadastro, consulta, atualização e remoção de usuários utilizando API REST com Amazon API Gateway, AWS Lambda e MongoDB.

🛠️ Arquitetura
<p align="center"> <img src="https://github.com/IgorCruzz/cdk-samples/blob/main/_diagrams/user-service.png" alt="Arquitetura User Service" /> </p>
🚀 Principais Funcionalidades
➕ Cadastro de usuários via API REST

🔍 Consulta de usuários

✏️ Atualização de dados dos usuários

❌ Remoção de usuários

🔄 Integração com MongoDB para armazenar as informações

📦 Tecnologias & Serviços
Amazon API Gateway – Endpoint público para as rotas de gerenciamento de usuários

AWS Lambda – Funções serverless responsáveis por:

Criar, buscar, atualizar e deletar usuários

MongoDB – Banco NoSQL para persistência dos dados dos usuários

AWS CDK – Infraestrutura como código (IaC)