use finalproject;
/* ************************************************************
   Table: patients
   Description:
   Stores information on patients for our database
   ************************************************************ */
create table patients (
    patient_id int, -- Unique Patient ID for each patient. (auto_increment is a built in SQL function)
    first_name varchar(50) not null,
    last_name varchar(50) not null,
    date_of_birth date not null, -- date of birth in YYYY-MM-DD format
    gender enum('Male', 'Female', 'Other'), -- Only allows for three options, any other input will not work
    phone_number varchar(15) unique, 
    email varchar(75) unique,
    address varchar(100),
    state char(2), -- 2 letter State Abreveation
    city varchar(50),
    zip_code varchar(10),
    insurance_provider varchar(100),
    current_patient boolean default true, -- Indicates if the patient is currently active
    
    constraint PK_patients primary key (patient_id) -- Primary Key
);
/* ************************************************************
   Table: doctors
   Description:
   Stores information on doctors for our database
   ************************************************************ */
create table doctors (
	doctor_id int, -- Unique doctor ID for doctors
    first_name varchar(50) not null,
    last_name varchar(50) not null,
    specialty varchar(75) not null, -- Should I create a ENUM for this?
    department varchar(100), -- Same with this
    license_number varchar(50) unique,
    phone_number varchar(15) unique,
    email varchar(75) unique,
    office_number varchar(25),
    current_doctor boolean default true, -- Is the doctor currently working
    
    
    constraint PK_doctors primary key (doctor_id) -- Primary Key
);
/* ************************************************************
   Table: medicines
   Description:
   Stores information on medicines for our database
   ************************************************************ */
create table medicines (
	medicine_id int, -- Unique medicine ID for medicines
    medicine_name varchar(50) not null, -- Exact name for medicine, ex  Tylenol or Advil
    generic_name varchar(50), -- Generic name, ex Acetaminophen or Ibuprofen
    dosage_type varchar(50) not null, -- Should I make this an ENUM?
    strength varchar(50) not null,
    manufacturer varchar(100),
    needs_prescription boolean default true, -- Is a perscription needed to obtain this?
    instructions varchar(300),
    side_effects varchar(300),
    currently_used boolean default true, -- is the medicine currently being used?
	
    
    constraint PK_medicines primary key (medicine_id) -- Primary Key
);
/* ************************************************************
   Table: appointments
   Description:
   Stores information on appointments for our database
   ************************************************************ */
create table appointments (
    appointment_id int,
    patient_id int not null,
    doctor_id int not null,
    -- Date and time of the appointment
    appointment_date date not null,
    appointment_time time not null,
    reason_for_visit varchar(200),
    -- Appointment status to track if it is upcoming, completed, or canceled
    status enum('Scheduled', 'Completed', 'Canceled', 'No-Show') default 'Scheduled',
    -- Only avaliable if the appointment has been completed
    medicine_id int default null,
    notes varchar(500),
    
    -- Primary key 
    constraint PK_appointments primary key (appointment_id),
    
    -- Foreign keys
    constraint FK_appointments_patients foreign key (patient_id)
        references patients(patient_id),
    constraint FK_appointments_doctors foreign key (doctor_id)
        references doctors(doctor_id),
    constraint FK_appointments_medicines foreign key (medicine_id)
        references medicines(medicine_id)
);


-- Allows for auto_increment
set foreign_key_checks = 0;
alter table doctors
modify doctor_id int not null auto_increment;

alter table patients
modify patient_id int not null auto_increment;

alter table medicines
modify medicine_id int not null auto_increment;

alter table appointments
modify appointment_id int not null auto_increment;

set foreign_key_checks = 1;



    
	
    

    
    


