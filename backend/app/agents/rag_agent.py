from rag_qa import search_knowledge, generate_answer


class RAGKnowledgeAgent:
    name = "RAG Knowledge Agent"

    def search(self, question: str):
        documents = search_knowledge(question)

        return {
            "question": question,
            "documents": documents,
            "sources_used": len(documents),
        }

    def answer(self, question: str):
        documents = search_knowledge(question)

        context = "\n\n".join(documents)

        answer = generate_answer(
            question,
            context,
        )

        return {
            "question": question,
            "answer": answer,
            "sources_used": len(documents),
        }


rag_agent = RAGKnowledgeAgent()