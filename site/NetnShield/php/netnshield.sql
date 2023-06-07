#------------------------------------------------------------
#        Script MySQL.
#------------------------------------------------------------


#------------------------------------------------------------
# Table: user
#------------------------------------------------------------

CREATE TABLE user(
user_id Int  Auto_increment  NOT NULL ,
pseudo  Mediumtext NOT NULL ,
image   Longtext ,
hash    Char (64) ,
token   Varchar (20) ,
etat    Bool
,CONSTRAINT user_PK PRIMARY KEY (user_id)
)ENGINE=InnoDB;


#------------------------------------------------------------
# Table: messages
#------------------------------------------------------------

CREATE TABLE messages(
message_id      Int  Auto_increment  NOT NULL ,
destinataire_id Int ,
date            Datetime ,
texte           Longtext ,
user_id         Int NOT NULL
,CONSTRAINT messages_PK PRIMARY KEY (message_id)

,CONSTRAINT messages_user_FK FOREIGN KEY (user_id) REFERENCES user(user_id)
)ENGINE=InnoDB;


#------------------------------------------------------------
# Table: amis
#------------------------------------------------------------

CREATE TABLE amis(
groupe_id Int  Auto_increment  NOT NULL ,
user_id2  Int NOT NULL ,
user_id   Int NOT NULL
,CONSTRAINT amis_PK PRIMARY KEY (groupe_id)

,CONSTRAINT amis_user_FK FOREIGN KEY (user_id) REFERENCES user(user_id)
)ENGINE=InnoDB;


INSERT INTO user(user_id,pseudo,hash,etat) VALUES 
(1,'Support',SHA2('password1',256),1),
(2,'Admin',SHA2('Admin',256),0),
(3,'Emilio',SHA2('password3',256),0),
(4,'Edgar',SHA2('password4',256),0),
(5,'NicoCharbo',SHA2('password5',256),0),
(6,'Quentin',SHA2('password6',256),0),
(7,'Mathieu',SHA2('password7',256),0),
(8,'Hugo',SHA2('password8',256),0),
(9,'Pierre',SHA2('password9',256),0);

INSERT INTO amis(user_id,user_id2) VALUES
(1,2),
(2,1),
(1,3),
(3,1),
(1,4),
(4,1),
(1,5),
(5,1),
(1,6),
(6,1),
(1,7),
(7,1),
(1,8),
(8,1),
(1,9),
(9,1);

INSERT INTO messages (destinataire_id, date, texte, user_id) VALUES 
(4, '2023-03-28 10:00:00', 'Salut, comment vas-tu ?', 3),
(3, '2023-03-28 10:05:00', 'Je vais bien, merci. Et toi ?', 4),
(4, '2023-03-28 10:10:00', 'ca va aussi.', 3),
(3, '2023-03-28 10:15:00', 'Cool !', 4),
(6, '2023-03-28 10:20:00', 'Salut !', 3),
(3, '2023-03-28 10:25:00', 'Bonjour, comment vas-tu ?', 6),
(6, '2023-03-28 10:30:00', 'Je vais bien, merci. Et toi ?', 3),
(3, '2023-03-28 10:35:00', 'Je vais bien aussi, merci.', 6),
(7, '2023-03-28 10:40:00', 'Salut, ca va ?', 3),
(3, '2023-03-28 10:45:00', 'Oui, ca va bien. Et toi ?', 7),
(7, '2023-03-28 10:50:00', 'Je vais bien aussi, merci.', 3),
(5, '2023-03-28 11:00:00', 'Salut, comment vas-tu ?', 4),
(4, '2023-03-28 11:05:00', 'Je vais bien, merci. Et toi ?', 5),
(8, '2023-03-28 11:10:00', 'Salut, ca va ?', 4),
(4, '2023-03-28 11:15:00', 'ca va bien et toi ?', 8),
(8, '2023-03-28 11:16:00', 'Tranquille tu fais quoi aujourd hui ?', 4),
(4, '2023-03-28 11:17:00', 'Afterwork a la taniere et toi ?', 8),
(8, '2023-03-28 11:16:00', 'La meme, et ca va tritonner ce soir en plus', 4);
