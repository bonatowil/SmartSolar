# Smart Solar

Projeto "Smart Solar" é uma aplicação web que oferece funcionalidades para cálculo de retorno de investimento em energia solar e um catálogo de placas solares.

## Funcionalidades

### Frontend

*   **Página Inicial (home.html, index.html):** Apresenta uma visão geral do projeto e seus benefícios.
*   **Calculadora (calculadora.html, calc.js):** Permite aos usuários calcular o potencial de economia e retorno de investimento com base em dados de consumo de energia e informações sobre painéis solares.
*   **Catálogo de Placas (placas.html, placas.js):** Exibe uma lista de placas solares disponíveis, possivelmente com filtros e detalhes sobre cada placa.
*   **Cadastro de Placas (cadastro.html, cadastro\_placa.js):** Interface para adicionar novas placas ao catálogo (funcionalidade para administradores ou usuários específicos).
*   **Autenticação (login.js, register.js, verifica\_usuario.js):** Gerencia o login e registro de usuários, controlando o acesso a determinadas funcionalidades.
*   **Estilização (styles.css):** Define a aparência visual da aplicação.
*   **Recursos Visuais:** Inclui diversas imagens (pasta `frontend/assets/images`) utilizadas na interface.
*   **Utilitários JavaScript (utils.js, carrossel.js, check\_theme.js, dark.js, filter.js, map.js):** Contém scripts para funcionalidades diversas como carrossel de imagens, controle de tema (claro/escuro), filtros, mapas e outras utilidades.

### Backend

O backend é desenvolvido em Java com Spring Boot e oferece as seguintes APIs e funcionalidades:

*   **Cálculos (CalculoController.java, CalculoService.java, Calculo.java, CalculoDTO.java, ROIPeriodoDTO.java, CalculoRepository.java):** Implementa a lógica para realizar os cálculos de retorno de investimento e gerenciar os dados de cálculo.
*   **Gerenciamento de Placas (PlacaController.java, PlacaService.java, Placa.java, PlacaDTO.java, PlacaRepository.java):** Fornece endpoints para adicionar, listar, atualizar e excluir informações sobre as placas solares.
*   **Gerenciamento de Usuários (UsuarioController.java, UsuarioService.java, Usuario.java, UsuarioDTO.java, UsuarioPublicDTO.java, UsuarioRepository.java):** Gerencia o cadastro e autenticação de usuários.
*   **Configurações Gerais:**
    *   `application.properties`: Arquivo de configuração da aplicação.
    *   `CorsConfig.java`: Configuração de Cross-Origin Resource Sharing (CORS).
    *   `ResourceNotFoundException.java`: Exceção customizada para recursos não encontrados.
    *   `SecurityConfig.java`: Configuração de segurança, incluindo autenticação e autorização.

## Como configurar e executar

**Pré-requisitos:**

*   Java Development Kit (JDK)
*   Apache Maven
*   Um banco de dados (configurado em `backend/src/main/resources/application.properties`)

**Configuração do Backend:**

1.  Navegue até o diretório `backend`.
2.  Configure as propriedades do banco de dados no arquivo `src/main/resources/application.properties`.
3.  Execute `mvn install` para baixar as dependências.
4.  Execute `mvn spring-boot:run` para iniciar o servidor backend.

**Configuração do Frontend:**

1.  O frontend é composto por arquivos HTML, CSS e JavaScript estáticos. Não requer um servidor dedicado a menos que você precise de um para servir os arquivos.
2.  Abra os arquivos HTML (por exemplo, `frontend/templates/index.html`) diretamente no seu navegador ou configure um servidor web local simples para servi-los.
3.  Certifique-se de que o frontend esteja configurado para se comunicar com o backend na porta correta (verificar arquivos JavaScript na pasta `frontend/assets/js`).

**Observações:**

*   O `.vscode/settings.json` contém configurações específicas para o VS Code.
*   Os scripts `backend/mvnw` e `backend/mvnw.cmd` são wrappers Maven.
*   O arquivo `LICENSE` contém a licença do projeto.

Contribuições são bem-vindas!
