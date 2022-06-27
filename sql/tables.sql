create table Users(
    UsersID serial not null primary key,
    Firstname text,
    Lastname text,
    username varchar,
    pass varchar,
);

create table Favourites(
    FavouritesID serial not null primary key,
    movies varchar,
    PRIMARY KEY (FavouritesID),
    FOREIGN KEY (UsersID) REFERENCES Users(UsersID)
)