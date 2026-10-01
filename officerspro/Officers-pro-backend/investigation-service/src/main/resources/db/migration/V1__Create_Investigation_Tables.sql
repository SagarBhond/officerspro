-- Create Investigation table
CREATE TABLE IF NOT EXISTS Investigation (
    investigation_id INT AUTO_INCREMENT PRIMARY KEY,
    fir_id INT NOT NULL,
    officer_id INT NOT NULL,
    assigned_on DATETIME NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    arrest_status VARCHAR(50),
    created_by INT NOT NULL,
    created_on DATETIME NOT NULL,
    updated_by INT,
    updated_on DATETIME,
    INDEX idx_fir_id (fir_id),
    INDEX idx_officer_id (officer_id),
    INDEX idx_status (status)
);

-- Create Evidence table
CREATE TABLE IF NOT EXISTS Evidence (
    evidence_id INT AUTO_INCREMENT PRIMARY KEY,
    investigation_id INT NOT NULL,
    evidence_name VARCHAR(255) NOT NULL,
    description TEXT,
    evidence_type VARCHAR(100) NOT NULL,
    file_path VARCHAR(500),
    file_type VARCHAR(100),
    location_found VARCHAR(255),
    collected_by VARCHAR(255),
    collected_on DATETIME,
    created_by INT NOT NULL,
    created_on DATETIME NOT NULL,
    updated_by INT,
    updated_on DATETIME,
    FOREIGN KEY (investigation_id) REFERENCES Investigation(investigation_id) ON DELETE CASCADE,
    INDEX idx_investigation_id (investigation_id),
    INDEX idx_evidence_type (evidence_type)
);

-- Create Witness table
CREATE TABLE IF NOT EXISTS Witness (
    witness_id INT AUTO_INCREMENT PRIMARY KEY,
    investigation_id INT NOT NULL,
    witness_name VARCHAR(255) NOT NULL,
    witness_email VARCHAR(255),
    witness_profession VARCHAR(255),
    witness_gender VARCHAR(50),
    witness_address TEXT,
    witness_age INT,
    witness_aadhar_no VARCHAR(12),
    witness_mobile_no VARCHAR(15),
    witness_statement TEXT,
    witness_type VARCHAR(50) NOT NULL,
    aadhar_file_path VARCHAR(500),
    pan_file_path VARCHAR(500),
    passport_file_path VARCHAR(500),
    photo_file_path VARCHAR(500),
    created_by INT NOT NULL,
    created_on DATETIME NOT NULL,
    updated_by INT,
    updated_on DATETIME,
    FOREIGN KEY (investigation_id) REFERENCES Investigation(investigation_id) ON DELETE CASCADE,
    INDEX idx_investigation_id (investigation_id),
    INDEX idx_witness_type (witness_type)
);
