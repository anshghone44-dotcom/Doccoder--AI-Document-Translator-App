import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { IngestionService } from "@/lib/parsing/ingestion-service"

export async function GET(req: NextRequest) {
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

    try {
        // 1. Get metadata from DB
        const { data: doc, error: fetchError } = await supabase
            .from("user_documents")
            .select("*")
            .eq("id", id)
            .single()

        if (fetchError || !doc) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 })
        }

        // 2. Download from Storage
        const { data: fileData, error: storageError } = await supabase.storage
            .from("documents")
            .download(doc.file_path)

        if (storageError) {
            return NextResponse.json({ error: storageError.message }, { status: 500 })
        }

        // 3. Process for RAG
        const file = new File([fileData], doc.filename, { type: doc.file_type || "application/pdf" })
        const { documentId, document } = await IngestionService.processForRAG(file)

        // 4. Update status to completed
        await supabase
            .from("user_documents")
            .update({ status: "completed" })
            .eq("id", id)

        return NextResponse.json({
            documentId,
            filename: doc.filename,
            content: document.content.slice(0, 10000)
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
