using Estoque.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Estoque.Domain.Entities
{
    public class User
    {
        private User() { }

        public User(string name, string email, string passwordHash, UserRole role)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(name);
            ArgumentException.ThrowIfNullOrWhiteSpace(email);
            ArgumentException.ThrowIfNullOrWhiteSpace(passwordHash);

            Name = name.Trim();
            Email = email.Trim().ToLowerInvariant();
            PasswordHash = passwordHash;
            Role = role;
            IsActive = true;
            CreatedAt = UpdatedAt = DateTime.UtcNow;
        }
        public int Id { get; private set; }
        public string Name { get; private set; } = null!;
        public string Email { get; private set; } = null!;
        public string PasswordHash { get; private set; } = null!;
        public UserRole Role { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        public void Update(string name, string email, UserRole role)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(name);
            ArgumentException.ThrowIfNullOrWhiteSpace(email);

            Name = name.Trim();
            Email = email.Trim().ToLowerInvariant();
            Role = role;
            UpdatedAt = DateTime.UtcNow;
        }

        public void ChangePasswordHash(string passwordHash)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(passwordHash);
            PasswordHash = passwordHash;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Activate() { IsActive = true; UpdatedAt = DateTime.UtcNow; }

        public void Deactivate() { IsActive = false; UpdatedAt = DateTime.UtcNow; }
    }
}
