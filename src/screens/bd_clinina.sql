
create database if not exists clinica_doofenshmirtz;
-- Criar a base de dados
DROP DATABASE IF EXISTS clinica_doofenshmirtz;
CREATE DATABASE clinica_doofenshmirtz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clinica_doofenshmirtz;


CREATE TABLE Paciente (
    id_paciente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_nascimento DATE NOT NULL,
    bi VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE Telefone_Paciente (
    id_telefone INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    tipo ENUM('Celular', 'Fixo', 'Trabalho') DEFAULT 'Celular',
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente) ON DELETE CASCADE
);


CREATE TABLE Endereco_Paciente (
    id_endereco INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT NOT NULL,
    rua VARCHAR(150) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    provincia VARCHAR(50) NOT NULL,
    tipo ENUM('Residencial', 'Comercial') DEFAULT 'Residencial',
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente) ON DELETE CASCADE
);


CREATE TABLE Medico (
    id_medico INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    especialidade VARCHAR(100) NOT NULL,
    bi VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: Telefone_Medico
-- =====================================================
CREATE TABLE Telefone_Medico (
    id_telefone INT AUTO_INCREMENT PRIMARY KEY,
    id_medico INT NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    tipo ENUM('Celular', 'Fixo', 'Trabalho') DEFAULT 'Celular',
    FOREIGN KEY (id_medico) REFERENCES Medico(id_medico) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: Endereco_Medico
-- =====================================================
CREATE TABLE Endereco_Medico (
    id_endereco INT AUTO_INCREMENT PRIMARY KEY,
    id_medico INT NOT NULL,
    rua VARCHAR(150) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    provincia VARCHAR(50) NOT NULL,
    tipo ENUM('Residencial', 'Comercial') DEFAULT 'Residencial',
    FOREIGN KEY (id_medico) REFERENCES Medico(id_medico) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: Enfermeiro
-- =====================================================
CREATE TABLE Enfermeiro (
    id_enfermeiro INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    especialidade VARCHAR(100),
    bi VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: Telefone_Enfermeiro
-- =====================================================
CREATE TABLE Telefone_Enfermeiro (
    id_telefone INT AUTO_INCREMENT PRIMARY KEY,
    id_enfermeiro INT NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    tipo ENUM('Celular', 'Fixo', 'Trabalho') DEFAULT 'Celular',
    FOREIGN KEY (id_enfermeiro) REFERENCES Enfermeiro(id_enfermeiro) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: Recepcionista
-- =====================================================
CREATE TABLE Recepcionista (
    id_recepcionista INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    bi VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: Telefone_Recepcionista
-- =====================================================
CREATE TABLE Telefone_Recepcionista (
    id_telefone INT AUTO_INCREMENT PRIMARY KEY,
    id_recepcionista INT NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    tipo ENUM('Celular', 'Fixo', 'Trabalho') DEFAULT 'Celular',
    FOREIGN KEY (id_recepcionista) REFERENCES Recepcionista(id_recepcionista) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: Endereco_Recepcionista
-- =====================================================
CREATE TABLE Endereco_Recepcionista (
    id_endereco INT AUTO_INCREMENT PRIMARY KEY,
    id_recepcionista INT NOT NULL,
    rua VARCHAR(150) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    provincia VARCHAR(50) NOT NULL,
    tipo ENUM('Residencial', 'Comercial') DEFAULT 'Residencial',
    FOREIGN KEY (id_recepcionista) REFERENCES Recepcionista(id_recepcionista) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: Medicamento
-- =====================================================
CREATE TABLE Medicamento (
    id_medicamento INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    concentracao VARCHAR(50),
    forma_farmaceutica VARCHAR(50),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: Consulta
-- =====================================================
CREATE TABLE Consulta (
    id_consulta INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT NOT NULL,
    id_medico INT NOT NULL,
    tipo_consulta VARCHAR(100) NOT NULL,
    data_consulta DATETIME NOT NULL,
    status ENUM('Agendada', 'Realizada', 'Cancelada') DEFAULT 'Agendada',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente) ON DELETE RESTRICT,
    FOREIGN KEY (id_medico) REFERENCES Medico(id_medico) ON DELETE RESTRICT
);

-- =====================================================
-- TABELA: Prescricao
-- =====================================================
CREATE TABLE Prescricao (
    id_prescricao INT AUTO_INCREMENT PRIMARY KEY,
    id_consulta INT NOT NULL,
    data_prescricao DATE NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_consulta) REFERENCES Consulta(id_consulta) ON DELETE CASCADE
);

-- =====================================================
-- TABELA: Prescricao_Medicamento (Relacionamento N:M)
-- =====================================================
CREATE TABLE Prescricao_Medicamento (
    id_prescricao INT NOT NULL,
    id_medicamento INT NOT NULL,
    dosagem VARCHAR(100) NOT NULL,
    frequencia VARCHAR(100) NOT NULL,
    duracao VARCHAR(50) NOT NULL,
    instrucoes TEXT,
    PRIMARY KEY (id_prescricao, id_medicamento),
    FOREIGN KEY (id_prescricao) REFERENCES Prescricao(id_prescricao) ON DELETE CASCADE,
    FOREIGN KEY (id_medicamento) REFERENCES Medicamento(id_medicamento) ON DELETE RESTRICT
);

-- =====================================================
-- ÍNDICES PARA MELHORAR PERFORMANCE
-- =====================================================
CREATE INDEX idx_paciente_nome ON Paciente(nome);
CREATE INDEX idx_paciente_bi ON Paciente(bi);
CREATE INDEX idx_medico_nome ON Medico(nome);
CREATE INDEX idx_medico_especialidade ON Medico(especialidade);
CREATE INDEX idx_consulta_data ON Consulta(data_consulta);
CREATE INDEX idx_consulta_status ON Consulta(status);
CREATE INDEX idx_consulta_paciente ON Consulta(id_paciente);
CREATE INDEX idx_consulta_medico ON Consulta(id_medico);

-- =====================================================
-- DADOS DE EXEMPLO
-- =====================================================

-- Inserir Pacientes
INSERT INTO Paciente (nome, data_nascimento, bi) VALUES
('João Manuel Silva', '1985-03-15', '004567890LA042'),
('Maria Fernanda Costa', '1990-07-22', '005678901LA043'),
('Pedro António Santos', '1978-11-30', '003456789LA041'),
('Ana Paula Rodrigues', '1995-05-18', '006789012LA044'),
('Carlos Eduardo Sousa', '1982-09-10', '004678903LA045');

-- Inserir Telefones dos Pacientes
INSERT INTO Telefone_Paciente (id_paciente, telefone, tipo) VALUES
(1, '+244 923 456 789', 'Celular'),
(1, '+244 222 345 678', 'Fixo'),
(2, '+244 924 567 890', 'Celular'),
(3, '+244 925 678 901', 'Celular'),
(4, '+244 926 789 012', 'Celular'),
(5, '+244 927 890 123', 'Celular');

-- Inserir Endereços dos Pacientes
INSERT INTO Endereco_Paciente (id_paciente, rua, bairro, cidade, provincia) VALUES
(1, 'Rua Direita de Miramar, Casa 25', 'Miramar', 'Luanda', 'Luanda'),
(2, 'Avenida Talatona, Prédio 12, Apt 5B', 'Talatona', 'Luanda', 'Luanda'),
(3, 'Rua Comandante Gika, Nº 45', 'Alvalade', 'Luanda', 'Luanda'),
(4, 'Rua do Kilamba, Casa 78', 'Kilamba Kiaxi', 'Luanda', 'Luanda'),
(5, 'Avenida Hoji Ya Henda, Edifício Torres, Apt 10A', 'Maianga', 'Luanda', 'Luanda');

-- Inserir Médicos
INSERT INTO Medico (nome, especialidade, bi) VALUES
('Dr. Heinz Doofenshmirtz', 'Cardiologia', '001234567LA038'),
('Dra. Vanessa Doofenshmirtz', 'Pediatria', '002345678LA039'),
('Dr. Roger Doofenshmirtz', 'Ortopedia', '003456781LA040'),
('Dra. Charlene Doofenshmirtz', 'Dermatologia', '002456789LA041');

-- Inserir Telefones dos Médicos
INSERT INTO Telefone_Medico (id_medico, telefone, tipo) VALUES
(1, '+244 912 345 678', 'Celular'),
(1, '+244 222 123 456', 'Trabalho'),
(2, '+244 913 456 789', 'Celular'),
(3, '+244 914 567 890', 'Celular'),
(4, '+244 915 678 901', 'Celular');

-- Inserir Endereços dos Médicos
INSERT INTO Endereco_Medico (id_medico, rua, bairro, cidade, provincia) VALUES
(1, 'Avenida 4 de Fevereiro, Edifício Atlântico, Apt 15C', 'Ingombota', 'Luanda', 'Luanda'),
(2, 'Rua Rainha Ginga, Casa 67', 'Maianga', 'Luanda', 'Luanda'),
(3, 'Avenida Mortala Mohamed, Prédio 8, Apt 3A', 'Talatona', 'Luanda', 'Luanda'),
(4, 'Rua do Kinaxixi, Nº 123', 'Kinaxixi', 'Luanda', 'Luanda');

-- Inserir Enfermeiros
INSERT INTO Enfermeiro (nome, categoria, especialidade, bi) VALUES
('Enfª Teresa Gonçalves', 'Generalista', 'Enfermagem Geral', '007890123LA046'),
('Enfº António Ferreira', 'Especialista', 'UTI', '008901234LA047'),
('Enfª Luísa Martins', 'Generalista', 'Pediatria', '009012345LA048');

-- Inserir Telefones dos Enfermeiros
INSERT INTO Telefone_Enfermeiro (id_enfermeiro, telefone, tipo) VALUES
(1, '+244 928 901 234', 'Celular'),
(2, '+244 929 012 345', 'Celular'),
(3, '+244 930 123 456', 'Celular');

-- Inserir Recepcionistas
INSERT INTO Recepcionista (nome, bi) VALUES
('Cláudia Soares', '010123456LA049'),
('Ricardo Lopes', '011234567LA050');

-- Inserir Telefones dos Recepcionistas
INSERT INTO Telefone_Recepcionista (id_recepcionista, telefone, tipo) VALUES
(1, '+244 931 234 567', 'Celular'),
(2, '+244 932 345 678', 'Celular');

-- Inserir Endereços dos Recepcionistas
INSERT INTO Endereco_Recepcionista (id_recepcionista, rua, bairro, cidade, provincia) VALUES
(1, 'Rua Ndunduma, Casa 34', 'Viana', 'Luanda', 'Luanda'),
(2, 'Avenida Deolinda Rodrigues, Apt 7B', 'Rangel', 'Luanda', 'Luanda');

-- Inserir Medicamentos
INSERT INTO Medicamento (nome, concentracao, forma_farmaceutica, observacoes) VALUES
('Paracetamol', '500mg', 'Comprimido', 'Analgésico e antipirético'),
('Amoxicilina', '875mg', 'Comprimido', 'Antibiótico de largo espectro'),
('Ibuprofeno', '400mg', 'Comprimido', 'Anti-inflamatório não esteroide'),
('Omeprazol', '20mg', 'Cápsula', 'Inibidor da bomba de prótons'),
('Losartana', '50mg', 'Comprimido', 'Anti-hipertensivo'),
('Metformina', '850mg', 'Comprimido', 'Antidiabético oral'),
('Dipirona', '500mg', 'Comprimido', 'Analgésico e antipirético');

-- Inserir Consultas
INSERT INTO Consulta (id_paciente, id_medico, tipo_consulta, data_consulta, status, observacoes) VALUES
(1, 1, 'Consulta de Rotina', '2025-01-10 09:00:00', 'Agendada', 'Check-up cardiológico anual'),
(2, 2, 'Consulta Pediátrica', '2025-01-08 14:30:00', 'Realizada', 'Avaliação de crescimento'),
(3, 3, 'Consulta Ortopédica', '2025-01-05 10:00:00', 'Realizada', 'Dor no joelho direito'),
(1, 1, 'Consulta de Retorno', '2024-12-15 11:00:00', 'Realizada', 'Acompanhamento de pressão arterial'),
(4, 4, 'Consulta Dermatológica', '2025-01-12 15:00:00', 'Agendada', 'Avaliação de lesão cutânea'),
(5, 1, 'Consulta Cardiológica', '2024-12-20 08:30:00', 'Realizada', 'Dor no peito');

-- Inserir Prescrições
INSERT INTO Prescricao (id_consulta, data_prescricao, observacoes) VALUES
(2, '2025-01-08', 'Suplementação vitamínica'),
(3, '2025-01-05', 'Tratamento para dor e inflamação'),
(4, '2024-12-15', 'Controle de hipertensão'),
(6, '2024-12-20', 'Tratamento preventivo');

-- Inserir Relacionamento Prescrição-Medicamento
INSERT INTO Prescricao_Medicamento (id_prescricao, id_medicamento, dosagem, frequencia, duracao, instrucoes) VALUES
(2, 1, '500mg', '3x ao dia', '7 dias', 'Tomar após as refeições'),
(3, 3, '400mg', '2x ao dia', '10 dias', 'Tomar com alimentos'),
(3, 7, '500mg', 'Se necessário', '5 dias', 'Máximo 4x ao dia'),
(4, 5, '50mg', '1x ao dia', '30 dias', 'Tomar pela manhã'),
(4, 4, '20mg', '1x ao dia', '30 dias', 'Tomar em jejum');

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View: Consultas Completas
CREATE VIEW vw_consultas_completas AS
SELECT 
    c.id_consulta,
    c.data_consulta,
    c.tipo_consulta,
    c.status,
    p.nome AS nome_paciente,
    p.bi AS bi_paciente,
    m.nome AS nome_medico,
    m.especialidade,
    c.observacoes
FROM Consulta c
INNER JOIN Paciente p ON c.id_paciente = p.id_paciente
INNER JOIN Medico m ON c.id_medico = m.id_medico;

-- View: Prescrições Completas
CREATE VIEW vw_prescricoes_completas AS
SELECT 
    pr.id_prescricao,
    pr.data_prescricao,
    c.id_consulta,
    c.data_consulta,
    p.nome AS nome_paciente,
    m.nome AS nome_medico,
    med.nome AS nome_medicamento,
    pm.dosagem,
    pm.frequencia,
    pm.duracao,
    pm.instrucoes
FROM Prescricao pr
INNER JOIN Consulta c ON pr.id_consulta = c.id_consulta
INNER JOIN Paciente p ON c.id_paciente = p.id_paciente
INNER JOIN Medico m ON c.id_medico = m.id_medico
INNER JOIN Prescricao_Medicamento pm ON pr.id_prescricao = pm.id_prescricao
INNER JOIN Medicamento med ON pm.id_medicamento = med.id_medicamento;

CREATE VIEW vw_pacientes_completos AS
SELECT 
    p.id_paciente,
    p.nome,
    p.data_nascimento,
    p.bi,
    TIMESTAMPDIFF(YEAR, p.data_nascimento, CURDATE()) AS idade,
    GROUP_CONCAT(DISTINCT tp.telefone ORDER BY tp.telefone SEPARATOR ', ') AS telefones,
    ep.rua,
    ep.bairro,
    ep.cidade,
    ep.provincia
FROM Paciente p
LEFT JOIN Telefone_Paciente tp ON p.id_paciente = tp.id_paciente
LEFT JOIN Endereco_Paciente ep ON p.id_paciente = ep.id_paciente
GROUP BY p.id_paciente, p.nome, p.data_nascimento, p.bi, ep.rua, ep.bairro, ep.cidade, ep.provincia;



-- Procedure: Agendar Consulta
DELIMITER //
CREATE PROCEDURE sp_agendar_consulta(
    IN p_id_paciente INT,
    IN p_id_medico INT,
    IN p_tipo_consulta VARCHAR(100),
    IN p_data_consulta DATETIME
)
BEGIN
    -- Verificar se já existe consulta para o médico neste horário
    IF EXISTS (
        SELECT 1 FROM Consulta 
        WHERE id_medico = p_id_medico 
        AND data_consulta = p_data_consulta 
        AND status != 'Cancelada'
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Médico já possui consulta agendada neste horário';
    ELSE
        INSERT INTO Consulta (id_paciente, id_medico, tipo_consulta, data_consulta, status)
        VALUES (p_id_paciente, p_id_medico, p_tipo_consulta, p_data_consulta, 'Agendada');
    END IF;
END //
DELIMITER ;

-- Procedure: Relatório de Consultas por Período
DELIMITER //
CREATE PROCEDURE sp_relatorio_consultas(
    IN p_data_inicio DATE,
    IN p_data_fim DATE
)
BEGIN
    SELECT 
        DATE(c.data_consulta) AS data,
        COUNT(*) AS total_consultas,
        SUM(CASE WHEN c.status = 'Realizada' THEN 1 ELSE 0 END) AS realizadas,
        SUM(CASE WHEN c.status = 'Agendada' THEN 1 ELSE 0 END) AS agendadas,
        SUM(CASE WHEN c.status = 'Cancelada' THEN 1 ELSE 0 END) AS canceladas
    FROM Consulta c
    WHERE DATE(c.data_consulta) BETWEEN p_data_inicio AND p_data_fim
    GROUP BY DATE(c.data_consulta)
    ORDER BY data;
END //

