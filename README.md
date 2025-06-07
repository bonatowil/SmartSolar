# Smart Solar

## Sobre o Projeto

O "Smart Solar" é uma aplicação web completa projetada para simplificar a adoção de energia solar. Ele oferece a usuários a capacidade de calcular o retorno sobre o investimento (ROI) para a instalação de painéis solares, além de fornecer um catálogo detalhado de placas solares disponíveis. A plataforma é construída com um backend robusto em Java com Spring Boot e um frontend interativo e amigável.

## 🌟 Funcionalidades Principais

### Frontend
* **Página Inicial (`home.html`, `index.html`):** Apresenta uma visão geral do projeto e seus benefícios.
* **Calculadora de ROI (`calculadora.html`, `calc.js`):** Permite que os usuários calculem a economia potencial e o retorno do investimento com base no consumo de energia, localização e especificações dos painéis solares.
* **Catálogo de Placas (`placas.html`, `placas.js`):** Exibe uma lista de placas solares disponíveis com filtros e detalhes técnicos para cada modelo.
* **Cadastro e Edição de Placas (`cadastro.html`, `cadastro_placa.js`):** Uma interface para administradores ou usuários autorizados adicionarem e gerenciarem as placas no catálogo.
* **Autenticação de Usuário (`login.js`, `register.js`, `verifica_usuario.js`):** Gerencia o login e registro de novos usuários, controlando o acesso a funcionalidades específicas da aplicação.
* **Design Responsivo e Moderno (`styles.css`):** Define a aparência visual da aplicação, garantindo uma experiência de usuário consistente em diferentes dispositivos.
* **Recursos Interativos (`utils.js`, `carrossel.js`, `check_theme.js`, `dark.js`, `filter.js`, `map.js`):** Scripts que implementam funcionalidades como carrossel de imagens, alternância de tema (claro/escuro), filtros de busca, mapas interativos e outras utilidades para melhorar a experiência do usuário.

### Backend
O backend é desenvolvido em Java utilizando o Spring Boot, fornecendo uma API RESTful para as seguintes funcionalidades:

* **Cálculos de ROI (`CalculoController.java`, `CalculoService.java`):** Implementa a lógica de negócio para realizar os cálculos de retorno de investimento e gerenciar os dados relacionados.
* **Gerenciamento de Placas (`PlacaController.java`, `PlacaService.java`):** Fornece endpoints para criar, listar, atualizar e deletar informações sobre as placas solares no catálogo.
* **Gerenciamento de Usuários (`UsuarioController.java`, `UsuarioService.java`):** Gerencia o cadastro, autenticação e informações dos usuários.
* **Configurações e Segurança:**
    * `application.properties`: Arquivo central de configuração da aplicação.
    * `CorsConfig.java`: Configuração para `Cross-Origin Resource Sharing` (CORS), permitindo a comunicação entre o frontend e o backend.
    * `ResourceNotFoundException.java`: Exceção customizada para um tratamento de erros mais claro quando um recurso não é encontrado.
    * `SecurityConfig.java`: Configurações de segurança da aplicação, incluindo autenticação e autorização de endpoints.

## 🛠️ Tecnologias Utilizadas

**Backend:**
* Java 21
* Spring Boot 3.4.5
* Spring Data JPA
* Spring Security
* Maven
* MySQL Connector
* Lombok
* SpringDoc OpenAPI (para documentação de API)

**Frontend:**
* HTML5
* CSS3
* JavaScript (ES6+)
* Tailwind CSS
* Flowbite
* Chart.js (para gráficos)
* Google Maps API (para geolocalização e desenho no mapa)

**Banco de Dados:**
* MySQL

## 🚀 Como Configurar e Executar

Siga os passos abaixo para ter a aplicação rodando localmente.

### Pré-requisitos
* **Java Development Kit (JDK):** Versão 21 ou superior.
* **Apache Maven:** Para gerenciamento de dependências do backend.
* **Banco de Dados MySQL:** Um servidor MySQL em execução.

### Configuração do Backend
1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/bonatowil/smartsolar.git
    cd smartsolar/backend
    ```
2.  **Configure o Banco de Dados:**
    * Abra o arquivo `src/main/resources/application.properties`.
    * Altere as propriedades `spring.datasource.url`, `spring.datasource.username`, e `spring.datasource.password` com as suas credenciais do MySQL.
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/smartsolar
    spring.datasource.username=seu_usuario
    spring.datasource.password=sua_senha
    ```
3.  **Instale as dependências:**
    Execute o comando a seguir na pasta `backend`:
    ```bash
    mvn install
    ```
4.  **Execute a Aplicação:**
    Use o Maven para iniciar o servidor Spring Boot:
    ```bash
    mvn spring-boot:run
    ```
    O backend estará rodando em `http://localhost:8080`, ou na porta e IP configurados em `src/main/resources/application.properties`.

### Configuração do Frontend
1.  **Navegue até a pasta do frontend:**
    A partir da raiz do projeto, acesse a pasta `frontend`.
2.  **Abra os arquivos no navegador:**
    Como o frontend é composto por arquivos estáticos (HTML, CSS, JS), recomenda-se o uso de uma extensão como o "Live Server" no VS Code para uma melhor experiência de desenvolvimento. Certifique-se que a porta utilizada pelo frontend seja a 5500, caso seja alterada, será necessário alterar `CorsConfig.java` para a nova porta.
    * Para a página de login, abra `frontend/templates/index.html`.
3.  **Verifique a comunicação com o backend:**
    Certifique-se de que as constantes `API_BASE_URL` nos arquivos JavaScript na pasta `frontend/assets/js` estão apontando para o endereço correto do backend (`http://localhost:8080`).

## 📝 Endpoints da API

A documentação completa da API está disponível via SpringDoc OpenAPI quando o backend está em execução. Acesse: `http://localhost:8080/swagger-ui.html`

### Principais Endpoints:

* **Autenticação:**
    * `GET /usuario/auth`: Autentica um usuário com base no email and senha.

* **Usuários:**
    * `POST /usuario/`: Cria um novo usuário.
    * `GET /usuario/{usuarioId}`: Obtém informações públicas de um usuário.

* **Placas Solares:**
    * `POST /placa/`: Adiciona uma nova placa solar.
    * `GET /placa/`: Lista todas as placas, com possibilidade de filtros.
    * `GET /placa/{placaId}`: Obtém uma placa específica por seu ID.
    * `PUT /placa/{placaId}`: Atualiza uma placa existente.
    * `DELETE /placa/{placaId}`: Remove uma placa.

* **Cálculos:**
    * `POST /calculo/`: Salva um novo cálculo de simulação.
    * `GET /calculo/ROI/{calculoId}`: Retorna a projeção de ROI detalhada para um cálculo salvo.
    * `GET /calculo/endereco`: Obtém coordenadas (latitude e longitude) a partir de um CEP.

## 🤝 Contribuições

Contribuições são sempre bem-vindas! Se você tem alguma sugestão para melhorar este projeto, sinta-se à vontade para criar um "fork" do repositório e abrir um "pull request".