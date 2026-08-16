create table users (
  id integer primary key autoincrement,
  username text not null unique,
  password_hash text not null,
  created_at integer not null default (unixepoch())
);

create index users_username_idx on users (username);
