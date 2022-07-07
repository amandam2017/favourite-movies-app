create table Users(
    id serial not null primary key,
    Firstname text,
    Lastname text,
    username varchar,
    pass varchar
);

create table Favourites(
    id serial not null primary key,
    movies varchar,
    users_id varchar,
    FOREIGN KEY (users_id) REFERENCES Users(id)
);