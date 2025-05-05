import streamlit as st
from normalize import normalize, DEFAULT_CONFIG

# Configure the Streamlit app
st.set_page_config(
    page_title="AI Text Cleaner",
    page_icon="✂️",
)

st.title("AI Text Cleaner")
st.write("Clean and normalize your text by removing special characters and normalizing quotes, dashes, and ligatures.")

# Text input area
input_text = st.text_area("Enter text to normalize", height=200)

# Render config options dynamically in a collapsed expander with two columns
config = {}
options = list(DEFAULT_CONFIG.items())
half = (len(options) + 1) // 2
left_opts = options[:half]
right_opts = options[half:]
with st.expander("Options", expanded=False):
    col1, col2 = st.columns(2)
    for option, default in left_opts:
        label = option.replace('_', ' ').title()
        config[option] = col1.checkbox(label, value=default)
    for option, default in right_opts:
        label = option.replace('_', ' ').title()
        config[option] = col2.checkbox(label, value=default)

# Normalize on button click
if st.button("Normalize Text"):
    if input_text:
        result = normalize(input_text, config)
        st.subheader("Normalized Text")
        st.text_area("", result, height=200)
    else:
        st.error("Please enter some text to normalize.")
