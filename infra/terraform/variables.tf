variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "ap-southeast-1"
}

variable "project_name" {
  type        = string
  description = "Project name used for resource naming"
  default     = "sanfast-delivery"
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type"
  default     = "t3.micro"
}

variable "ssh_public_key" {
  type        = string
  description = "SSH public key for EC2 access"
}

variable "ssh_allowed_cidr" {
  type        = string
  description = "CIDR block allowed to SSH (your IP/32)"
  default     = "0.0.0.0/0"
}

variable "db_password" {
  type        = string
  description = "PostgreSQL password"
  sensitive   = true
  default     = "SanFast2024Secure!"
}

variable "jwt_secret" {
  type        = string
  description = "JWT secret for auth"
  sensitive   = true
  default     = "SanFastDeliveryJwtSecretKey2024VeryLongAndSecure"
}

variable "rabbitmq_user" {
  type        = string
  description = "RabbitMQ username"
  default     = "sanfast"
}

variable "rabbitmq_pass" {
  type        = string
  description = "RabbitMQ password"
  sensitive   = true
  default     = "SanFastRabbit2024!"
}

variable "gemini_api_key" {
  type        = string
  description = "Google Gemini API key (optional)"
  sensitive   = true
  default     = "REPLACEME"
}
