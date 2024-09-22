import streamlit as st

pg = st.navigation([st.Page("app.py"), st.Page("test.py")])
pg.run()