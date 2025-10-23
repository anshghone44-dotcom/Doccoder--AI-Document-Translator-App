import TransformChat from "@/components/transform-chat"
import ReverseTransformChat from "@/components/reverse-transform-chat"

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      <section className="mb-8 text-center">
        <h1 className="font-playfair text-balance text-5xl font-bold tracking-tight">Doccoder</h1>
        <p className="mt-2 text-muted-foreground">Transform documents with AI-powered intelligence</p>
      </section>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Convert to PDF</h2>
          <TransformChat />
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Convert from PDF</h2>
          <ReverseTransformChat />
        </section>
      </div>
    </main>
  )
}
