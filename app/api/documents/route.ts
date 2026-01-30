import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
        .from("user_documents")
        .select("*")
        .order("created_at", { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const formData = await req.formData()
        const file = formData.get("file") as File
        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("documents")
            .upload(`${user.id}/${Date.now()}_${file.name}`, file)

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message }, { status: 500 })
        }

        const { data: docData, error: docError } = await supabase
            .from("user_documents")
            .insert({
                user_id: user.id,
                filename: file.name,
                file_path: uploadData.path,
                file_type: file.type || file.name.split('.').pop(),
                size: file.size,
                status: "uploaded"
            })
            .select()
            .single()

        if (docError) {
            // Cleanup storage if database insert fails
            await supabase.storage.from("documents").remove([uploadData.path])
            return NextResponse.json({ error: docError.message }, { status: 500 })
        }

        return NextResponse.json(docData)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
        return NextResponse.json({ error: "No ID provided" }, { status: 400 })
    }

    // Get file path first
    const { data: doc, error: fetchError } = await supabase
        .from("user_documents")
        .select("file_path")
        .eq("id", id)
        .single()

    if (fetchError || !doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([doc.file_path])

    if (storageError) {
        return NextResponse.json({ error: storageError.message }, { status: 500 })
    }

    // Delete from database
    const { error: deleteError } = await supabase
        .from("user_documents")
        .delete()
        .eq("id", id)

    if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
