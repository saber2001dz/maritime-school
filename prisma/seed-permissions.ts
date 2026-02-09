import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const roles = [
  {
    name: "administrateur",
    displayName: "Administrateur",
    description: "Acces complet a toutes les fonctionnalites du systeme",
    color: "purple",
    isSystem: true,
  },
  {
    name: "direction",
    displayName: "Direction",
    description: "Supervision et validation des operations",
    color: "indigo",
    isSystem: false,
  },
  {
    name: "coordinateur",
    displayName: "Service Programmation",
    description: "Gestion des agents et des formations",
    color: "blue",
    isSystem: false,
  },
  {
    name: "formateur",
    displayName: "Service Formation",
    description: "Consultation des agents et des formations",
    color: "green",
    isSystem: false,
  },
  {
    name: "agent",
    displayName: "Agent",
    description: "Acces de base en lecture seule",
    color: "gray",
    isSystem: false,
  },
]

const resources = [
  {
    name: "user",
    displayName: "Utilisateurs",
    description: "Gestion des comptes utilisateurs",
    actions: ["create", "list", "update", "delete", "set-role"],
    actionLabels: { create: "Créer", list: "Lister", update: "Modifier", delete: "Supprimer", "set-role": "Définir le rôle" },
  },
  {
    name: "agent",
    displayName: "Agents",
    description: "Gestion des agents maritimes",
    actions: ["create", "edit", "delete", "view"],
    actionLabels: { create: "Créer", edit: "Modifier", delete: "Supprimer", view: "Consulter" },
  },
  {
    name: "formation",
    displayName: "Formations",
    description: "Gestion des formations",
    actions: ["create", "edit", "delete", "view"],
    actionLabels: { create: "Créer", edit: "Modifier", delete: "Supprimer", view: "Consulter" },
  },
  {
    name: "session",
    displayName: "Sessions",
    description: "Gestion des sessions utilisateur",
    actions: ["list", "revoke"],
    actionLabels: { list: "Lister", revoke: "Révoquer" },
  },
  {
    name: "formateur",
    displayName: "Formateurs",
    description: "Gestion des formateurs",
    actions: ["create", "edit", "delete", "view"],
    actionLabels: { create: "Créer", edit: "Modifier", delete: "Supprimer", view: "Consulter" },
  },
  {
    name: "cours",
    displayName: "Cours",
    description: "Gestion des cours",
    actions: ["create", "edit", "delete", "view"],
    actionLabels: { create: "Créer", edit: "Modifier", delete: "Supprimer", view: "Consulter" },
  },
  {
    name: "sessionFormation",
    displayName: "Sessions de Formation",
    description: "Gestion des sessions de formation",
    actions: ["create", "edit", "delete", "view"],
    actionLabels: { create: "Créer", edit: "Modifier", delete: "Supprimer", view: "Consulter" },
  },
  {
    name: "agentFormation",
    displayName: "Formations des Agents",
    description: "Gestion des inscriptions agents-formations",
    actions: ["create", "edit", "delete", "view"],
    actionLabels: { create: "Créer", edit: "Modifier", delete: "Supprimer", view: "Consulter" },
  },
  {
    name: "coursFormateur",
    displayName: "Cours des Formateurs",
    description: "Gestion des affectations cours-formateurs",
    actions: ["create", "edit", "delete", "view"],
    actionLabels: { create: "Créer", edit: "Modifier", delete: "Supprimer", view: "Consulter" },
  },
  {
    name: "sessionAgent",
    displayName: "Agents des Sessions",
    description: "Gestion des agents inscrits aux sessions",
    actions: ["create", "edit", "delete", "view"],
    actionLabels: { create: "Créer", edit: "Modifier", delete: "Supprimer", view: "Consulter" },
  },
]

// Matrice de permissions (identique à l'ancien lib/permissions.ts)
const rolePermissions: Record<string, Record<string, string[]>> = {
  administrateur: {
    user: ["create", "list", "update", "delete", "set-role"],
    agent: ["create", "edit", "delete", "view"],
    formation: ["create", "edit", "delete", "view"],
    session: ["list", "revoke"],
    formateur: ["create", "edit", "delete", "view"],
    cours: ["create", "edit", "delete", "view"],
    sessionFormation: ["create", "edit", "delete", "view"],
    agentFormation: ["create", "edit", "delete", "view"],
    coursFormateur: ["create", "edit", "delete", "view"],
    sessionAgent: ["create", "edit", "delete", "view"],
  },
  direction: {
    agent: ["view"],
    formation: ["view"],
    session: ["list"],
    formateur: ["view"],
    cours: ["view"],
    sessionFormation: ["view"],
    agentFormation: ["view"],
    coursFormateur: ["view"],
    sessionAgent: ["view"],
  },
  coordinateur: {
    agent: ["edit", "view"],
    formation: ["edit", "view"],
    session: ["list"],
    formateur: ["edit", "view"],
    cours: ["edit", "view"],
    sessionFormation: ["edit", "view"],
    agentFormation: ["edit", "view"],
    coursFormateur: ["edit", "view"],
    sessionAgent: ["edit", "view"],
  },
  formateur: {
    agent: ["view"],
    formation: ["view"],
    formateur: ["view"],
    cours: ["view"],
    sessionFormation: ["view"],
    agentFormation: ["view"],
    coursFormateur: ["view"],
    sessionAgent: ["view"],
  },
  agent: {
    agent: ["view"],
    formation: ["view"],
  },
}

async function main() {
  console.log("🌱 Seeding roles, resources, and permissions...")

  // Upsert roles
  const roleMap: Record<string, string> = {}
  for (const role of roles) {
    const created = await prisma.role.upsert({
      where: { name: role.name },
      update: {
        displayName: role.displayName,
        description: role.description,
        color: role.color,
        isSystem: role.isSystem,
      },
      create: role,
    })
    roleMap[role.name] = created.id
    console.log(`  ✅ Role: ${role.name} (${created.id})`)
  }

  // Upsert resources
  const resourceMap: Record<string, string> = {}
  for (const resource of resources) {
    const created = await prisma.resource.upsert({
      where: { name: resource.name },
      update: {
        displayName: resource.displayName,
        description: resource.description,
        actions: resource.actions,
        actionLabels: resource.actionLabels,
      },
      create: {
        name: resource.name,
        displayName: resource.displayName,
        description: resource.description,
        actions: resource.actions,
        actionLabels: resource.actionLabels,
      },
    })
    resourceMap[resource.name] = created.id
    console.log(`  ✅ Resource: ${resource.name} (${created.id})`)
  }

  // Upsert role permissions
  for (const [roleName, perms] of Object.entries(rolePermissions)) {
    const roleId = roleMap[roleName]
    if (!roleId) continue

    for (const [resourceName, actions] of Object.entries(perms)) {
      const resourceId = resourceMap[resourceName]
      if (!resourceId) continue

      await prisma.rolePermission.upsert({
        where: { roleId_resourceId: { roleId, resourceId } },
        update: { actions },
        create: { roleId, resourceId, actions },
      })
    }
    console.log(`  ✅ Permissions for: ${roleName}`)
  }

  console.log("\n🎉 Seeding complete!")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
