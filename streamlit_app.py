import streamlit as st
from normalize import normalize

# Configure the Streamlit app
st.set_page_config(
    page_title="AI Text Cleaner",
    page_icon="✂️",
)

st.title("AI Text Cleaner")
st.write("Clean and normalize your text by removing special characters and normalizing quotes, dashes, and ligatures.")

# Text input area
input_text = st.text_area("Enter text to normalize", height=200)

# Normalize on button click
if st.button("Normalize Text"):
    if input_text:
        result = normalize(input_text)
        st.subheader("Normalized Text")
        st.text_area("", result, height=200)
    else:
        st.error("Please enter some text to normalize.")
