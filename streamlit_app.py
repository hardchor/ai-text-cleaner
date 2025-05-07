import streamlit as st
from normalize import normalize, DEFAULT_CONFIG

# Configure the Streamlit app
st.set_page_config(
    page_title="AI Text Cleaner",
    page_icon="✂️",
)

st.title("AI Text Cleaner")
st.write("Clean and normalize your text by removing special characters and normalizing quotes, dashes, and ligatures.")

# Wrap inputs and button in a form
with st.form(key="text_normalization_form"):
    # Text input area
    input_text = st.text_area("Enter text to normalize", height=200, key="input_text_area")

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
            config[option] = col1.checkbox(label, value=default, key=option + "_left") # Ensure unique keys
        for option, default in right_opts:
            label = option.replace('_', ' ').title()
            config[option] = col2.checkbox(label, value=default, key=option + "_right") # Ensure unique keys

    # Form submit button
    submitted = st.form_submit_button("Normalize Text")

# Process form submission
if submitted:
    if input_text:
        # `input_text` and `config` will have the values from the form submission
        result = normalize(input_text, config)
        st.subheader("Normalized Text")
        st.code(result, language="markdown")  # Display as code block
    else:
        st.error("Please enter some text to normalize.")
