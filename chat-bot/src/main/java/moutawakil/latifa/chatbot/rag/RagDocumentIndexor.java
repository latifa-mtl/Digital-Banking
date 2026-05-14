package moutawakil.latifa.chatbot.rag;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RagDocumentIndexor {
    @Bean
    public SimpleVectorStore vectorStore(
            EmbeddingModel embeddingModel
    ) {

        SimpleVectorStore vectorStore =
                SimpleVectorStore.builder(embeddingModel)
                        .build();

        PagePdfDocumentReader reader =
                new PagePdfDocumentReader(
                        new ClassPathResource(
                                "docs/banking-guide.pdf"
                        )
                );

        List<Document> documents = reader.get();

        TokenTextSplitter splitter = TokenTextSplitter.builder()
                .withChunkSize(800)
                .withMinChunkSizeChars(350)
                .withMinChunkLengthToEmbed(5)
                .withMaxNumChunks(10000)
                .build();

        List<Document> chunks = splitter.apply(documents);

        vectorStore.add(chunks);

        return vectorStore;
    }

}
