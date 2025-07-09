# 📊 Sheet Parse – Extração Serverless de Arquivos CSV

Esta aplicação **serverless** permite o **upload, processamento e extração automática de dados** de arquivos **CSV** enviados para o **Amazon S3**.

## 🛠️ Arquitetura

<p align="center">
  <img src="https://github.com/IgorCruzz/cdk-samples/blob/main/diagrams/sheet-parse.png" alt="Arquitetura Sheet Parse" />
</p>

## 🚀 Principais Funcionalidades

- ☁️ Geração de **URL pré-assinada** para upload seguro no S3  
- 📤 Upload de arquivos **CSV** diretamente para o bucket S3  
- ⚙️ Processamento automático via **Lambda** acionada por evento do S3  
- 📑 Extração de dados e armazenamento no **MongoDB** por demanda 
- 🧹 Remoção automática do arquivo após o processamento  

## 📦 Tecnologias & Serviços

- **Amazon API Gateway** – Endpoint público para gerar a URL de upload  
- **Amazon S3** – Armazenamento dos arquivos CSV enviados  
- **AWS Lambda** – Funções serverless para processamento dos arquivos  
- **MongoDB** – Banco NoSQL para persistência dos dados   
- **AWS CDK** – Infraestrutura como código (IaC)