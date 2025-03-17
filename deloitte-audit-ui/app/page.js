import QuestionPrompt from "./components/QuestionPrompt";

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
            <div className="container mx-auto pt-8 md:pt-16">
                <QuestionPrompt />
            </div>
        </main>
    );
}
