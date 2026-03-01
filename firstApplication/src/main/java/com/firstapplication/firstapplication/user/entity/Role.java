package com.firstapplication.firstapplication.user.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private int id;

  @Enumerated(EnumType.STRING)
  @Column(length = 20, unique = true, nullable = false)
  private RoleName name;


  public Role() {
  }

  ;

  public Role(RoleName name) {
    this.name = name;
  }


}

