create table
  public.runs (
    id bigint generated by default as identity not null,
    created_at timestamp with time zone null default now(),
    updated_at timestamp with time zone null default now(),
    planned_miles double precision null,
    actual_miles double precision null,
    date date null default current_date,
    notes character varying null,
    data json null,
    name text null,
    constraint runs_pkey primary key (id)
  ) tablespace pg_default;

