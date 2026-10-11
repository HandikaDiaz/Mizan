import { CreateSourceInput, UpdateSourceInput } from "../lib/type/sourceType"
import { db } from "../prisma/db"

export async function createSource(data: CreateSourceInput) {
  try {
    const source = await db.orm.public.Source.create({
      name: data.name,
      baseUrlOrHandle: data.baseUrlOrHandle,
      dataFormats: data.dataFormats,
      sourceType: data.sourceType,
      isOfficial: data.isOfficial,
      isActive: data.isActive,
    })

    return source
  } catch (error) {
    console.log(error)
  }
}

export async function updateSource(id: string, data: Partial<UpdateSourceInput>) {
  try {
    const source = await db.orm.public.Source.where({ id }).update(data)

    return source
  } catch (error) {
    console.log(error)
  }
}

export async function deleteSource(id: string) {
  try {
     const source = await db.orm.public.Source
    .where({ id })
    .first();

  if (!source) {
    return null;
  }
    const data = await db.orm.public.Source.where({ id }).delete()

    if (!data) {
      return { success: false, message: "Data tidak ditemukan" }
    }

    
    return data
  } catch (error) {
    console.log(error)
  }
}
