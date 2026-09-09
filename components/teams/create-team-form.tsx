"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Zone = {
  id: string
  name: string
  code: string | null
}

type Category = {
  id: string
  name: string
  code: string | null
  zones: Zone[]
}

type Props = {
  categories: Category[]
}

export default function CreateTeamForm({
  categories,
}: Props) {
  const router = useRouter()

  const [name, setName] = useState("")
  const [shortName, setShortName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const [selected, setSelected] = useState<
  Record<string, string[]>
>({})

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

function handleCategoryChange(
  categoryId: string,
  zoneId: string
) {
  setSelected((current) => {

    const currentZones =
      current[categoryId] ?? []

    const exists =
      currentZones.includes(zoneId)

    return {
      ...current,
      [categoryId]: exists
        ? currentZones.filter(
            (id) => id !== zoneId
          )
        : [...currentZones, zoneId]
    }

  })
}

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError("")
    setLoading(true)

    try {
      const categoryAssignments =
    Object.entries(selected).flatMap(
        ([category_id, zone_ids]) =>
            zone_ids.map(zone_id => ({
                category_id,
                zone_id
            }))
    )
      

      if (!categoryAssignments.length) {
        throw new Error(
          "Seleccioná al menos una categoría"
        )
      }

      const response = await fetch(
        "/api/teams",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            short_name: shortName,
            contact_email: email,
            contact_phone: phone,
            categories: categoryAssignments,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || "No se pudo crear el equipo"
        )
      }

      router.push("/teams")
      router.refresh()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium">
          Nombre del equipo
        </label>

        <input
          required
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="mt-1 w-full rounded-lg border p-3"
          placeholder="Ej: Club Deportivo ABC"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Nombre corto
        </label>

        <input
          value={shortName}
          onChange={(e) =>
            setShortName(e.target.value)
          }
          className="mt-1 w-full rounded-lg border p-3"
          placeholder="Ej: ABC"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="mt-1 w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Teléfono
          </label>

          <input
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            className="mt-1 w-full rounded-lg border p-3"
          />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold">
          Categorías y zonas
        </h2>

        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-lg border p-4"
            >
              <h3 className="font-semibold">
                {category.name}
              </h3>

              <div className="mt-3 flex gap-4">
                {category.zones.map((zone) => (
                  <label
                    key={zone.id}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      name={`category-${category.id}`}
                      checked={
                        selected[category.id]?.includes(zone.id) ?? false
                      }
                      onChange={() =>
                        handleCategoryChange(
                          category.id,
                          zone.id
                        )
                      }
                    />

                    {zone.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading
          ? "Creando equipo..."
          : "Crear equipo"}
      </button>
    </form>
  )
}