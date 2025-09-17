👥 Cron Job Service – Leitura Agendada de Dados
Esta aplicação serverless permite realizar leituras periódicas de dados no RDS PostgreSQL utilizando EventBridge e AWS Lambda.

🛠️ Arquitetura

<p align="center"> <img src="https://github.com/IgorCruzz/cdk-samples/blob/main/_diagrams/cron-job.png" alt="Arquitetura Cron Job Service" /> </p>

🚀 Principais Funcionalidades
⏰ Agendamento de tarefas via EventBridge (cron expression)

🔄 Execução automática de funções Lambda conforme agendamento

📊 Leitura de dados no RDS PostgreSQL sem alterações

📝 Possibilidade de gerar relatórios, enviar dados para outro serviço ou armazenar em logs

📦 Tecnologias & Serviços

Amazon EventBridge – Agendador de eventos para disparar funções Lambda periodicamente

AWS Lambda – Função serverless responsável por consultar dados no RDS

RDS PostgreSQL (Read-Only) – Banco relacional utilizado somente para leitura

AWS CDK – Infraestrutura como código (IaC) para provisionamento de recursos

CloudWatch – Monitoramento de logs e métricas da execução