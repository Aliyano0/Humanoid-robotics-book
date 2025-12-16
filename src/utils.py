from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List, Tuple
import tiktoken
import re

def count_tokens(text: str) -> int:
    """
    Count the number of tokens in a text string using tiktoken.
    Uses gpt-3.5-turbo encoding as a proxy for other models.
    """
    # Using cl100k_base encoding which is used by text-embedding-3-large
    encoding = tiktoken.get_encoding("cl100k_base")
    tokens = encoding.encode(text)
    return len(tokens)

def chunk_text(text: str, min_size: int = 200, max_size: int = 250, overlap: int = 40) -> List[str]:
    """
    Split text into chunks with specified size and overlap.
    Uses RecursiveCharacterTextSplitter from langchain.
    """
    # Create a text splitter with specified parameters for book content
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=max_size,  # 250 tokens max
        chunk_overlap=overlap,  # 40 tokens overlap
        length_function=count_tokens,
        is_separator_regex=False,
        # Split on common document separators to maintain context
        separators=["\n\n", "\n", " ", ""]
    )

    # Split the text
    chunks = splitter.split_text(text)

    # Filter chunks to ensure they meet minimum size requirements
    # Only return chunks that are at least min_size tokens (200)
    filtered_chunks = [chunk for chunk in chunks if min_size <= count_tokens(chunk) <= max_size]

    # If we have very small chunks that don't meet the minimum, try to combine them
    if len(filtered_chunks) == 0 and len(chunks) > 0:
        # If all chunks are too small, combine them in pairs until they meet the minimum
        combined_chunks = []
        current_chunk = ""

        for chunk in chunks:
            if count_tokens(current_chunk + chunk) <= max_size:
                current_chunk += " " + chunk
                if count_tokens(current_chunk) >= min_size:
                    combined_chunks.append(current_chunk.strip())
                    current_chunk = ""
            else:
                if current_chunk and count_tokens(current_chunk) >= min_size:
                    combined_chunks.append(current_chunk.strip())
                current_chunk = chunk

        # Add any remaining content if it meets the minimum size
        if current_chunk and count_tokens(current_chunk) >= min_size:
            combined_chunks.append(current_chunk.strip())

        return combined_chunks

    return filtered_chunks

def validate_query_text(query: str, max_tokens: int = 2000) -> Tuple[bool, str]:
    """
    Validate query text length against token limit.
    Returns (is_valid, error_message)
    """
    if not query or len(query.strip()) == 0:
        return False, "Query text cannot be empty"

    token_count = count_tokens(query)
    if token_count > max_tokens:
        return False, f"Query text exceeds maximum token limit of {max_tokens} tokens. Current: {token_count} tokens"

    return True, ""

def validate_selected_text(selected_text: str, max_tokens: int = 5000) -> Tuple[bool, str]:
    """
    Validate selected text length against token limit.
    Returns (is_valid, error_message)
    """
    if not selected_text or len(selected_text.strip()) == 0:
        # Selected text is optional, so empty is valid
        return True, ""

    token_count = count_tokens(selected_text)
    if token_count > max_tokens:
        return False, f"Selected text exceeds maximum token limit of {max_tokens} tokens. Current: {token_count} tokens"

    return True, ""

def validate_response_tokens(response: str, max_tokens: int = 500) -> Tuple[bool, str]:
    """
    Validate response length against token limit.
    Returns (is_valid, error_message)
    """
    token_count = count_tokens(response)
    if token_count > max_tokens:
        return False, f"Response exceeds maximum token limit of {max_tokens} tokens. Current: {token_count} tokens"

    return True, ""

def clean_text(text: str) -> str:
    """
    Clean text by removing extra whitespace and normalizing it.
    """
    # Remove extra whitespace and normalize
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text

def extract_citations_from_text(text: str) -> List[str]:
    """
    Extract potential citations from text (simple heuristic).
    This is a basic implementation that looks for common citation patterns.
    """
    # Look for common citation patterns like [Author, Year] or similar
    citation_pattern = r'\[([^\]]*?)\]'
    citations = re.findall(citation_pattern, text)
    return citations