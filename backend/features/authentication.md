# Authentication & Authorization Feature

## Overview

This module handles user identity, session management via Laravel Sanctum, and role-based access control (RBAC) using the Spatie Permission package.

## Key Components

### Controllers

- `AuthController`: Handles login, logout, getting the current user profile (`/me`), and updating passwords.
- `RolePermissionController`: Manages roles and permissions assignment.
- `UserController`: Provides RESTful endpoints for CRUD operations on users.

### Models

- `User`: The main authentication model. Contains relations to roles, divisions, and signatures.
    - **Roles**: Staff, HRD, GA Legal, Finance, GM, Director, Super Admin.

### API Routes

- `POST /login`: Authenticates user and returns Sanctum token.
- `POST /logout`: Revokes the current token.
- `GET /me`: Returns authenticated user profile including roles.
- `PUT /me/password`: Updates the authenticated user's password.
- `GET /roles-permissions`: Fetches all roles and permissions.
- `GET /roles/{id}`: Fetches specific role details.
- `PUT /roles/{id}/permissions`: Updates permissions for a specific role.
- `API Resource /users`: CRUD endpoints for managing users.

## Security & Middleware

- Uses `auth:sanctum` middleware to protect routes.
- Uses strict permission caching and middleware to restrict endpoints (e.g., `role:Super Admin`, `permission:manage master data`).
