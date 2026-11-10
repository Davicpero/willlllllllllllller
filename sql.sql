CREATE TABLE if not exists usuario(
id serial primary key,
nome varchar(100) not null,
email varchar(100) not null unique,
senha varchar(100) not null
);

CREATE TABLE if not exists tecnicos(
id serial primary key,
nome varchar(100) not null,
email varchar(100) not null unique,
rank varchar(100) not null unique
);

CREATE TABLE if not exists solicitantes(
id serial primary key,
nome varchar(100) not null,
email varchar(100) not null unique,
);

CREATE TABLE if not exists registros(
id serial primary key,
informaçao varchar(100),
numero int
);

CREATE TABLE if not exists vinculo(
id serial primary key,
data_vinculo date not null,
id_registros int not null,
id_tecnicos int not null,
id_solicitantes int not null,
foreign key (id_registros) references registros(id),
foreign key (id_tecnicos) references tecnicos(id),
foreign key (id_solicitantes) references solicitantes(id)
);
