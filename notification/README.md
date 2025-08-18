# 📣 Notificações Serverless (Email & WhatsApp)

Este projeto é uma aplicação **serverless** para envio de **notificações em tempo real** via **Email (Amazon SES)** e **WhatsApp (Twilio)**. Ele utiliza uma arquitetura totalmente escalável e gerenciada com serviços da AWS, como **API Gateway**, **Lambda**, **SNS**, **SQS** e **SES**.

## 🛠️ Arquitetura

<p align="center">
  <img src="https://github.com/IgorCruzz/cdk-samples/blob/main/_diagrams/notifications.png" alt="Arquitetura" />
</p>

## 🚀 Principais Funcionalidades

- 📧 Envio de emails transacionais com Amazon SES  
- 💬 Envio de mensagens WhatsApp via Twilio  
- 🔁 Processamento assíncrono e escalável com AWS SQS + Lambda  
- 🔔 Orquestração com SNS para múltiplos canais de notificação  
- ⚙️ Totalmente **serverless**, sem servidores para gerenciar  
- 📦 Separação clara de responsabilidades: API, processamento e entrega

 ## 📦 Tecnologias & Serviços

- AWS API Gateway – Endpoint público para requisições

- AWS Lambda – Funções serverless para orquestração e envio

- AWS SNS – Distribuição de mensagens para diferentes canais

- AWS SQS – Fila para processamento assíncrono

- Amazon SES – Serviço de envio de emails

- Twilio API – Envio de mensagens via WhatsApp