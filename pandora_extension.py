from IPython.core.magic import Magics, magics_class, line_magic, cell_magic, line_cell_magic, register_line_magic, register_cell_magic
from IPython import get_ipython
import openai
import os
from pprint import pprint
from IPython.display import Markdown

GPT_MODEL = "gpt-3.5-turbo-0613"

@magics_class
class Pandora(Magics):

    def __init__(self, shell):
        super(Pandora, self).__init__(shell)
        self.conversation = []
        self.messages = [ {"role": "system", "content": "You are an assistant in a notebook environment."}]

    # @line_magic
    # def add_comment(self, cell):
    #     new_cell_payload = dict(
    #                 source="set_next_input",
    #                 text="#Best python code ever written!",
    #                 replace=False,
    #             )
    #     ip = get_ipython()
    #     ip.payload_manager.write_payload(new_cell_payload)

    @line_magic
    def chat(self, line):
        self.messages.append({"role": "user", "content":line})
        response = openai.ChatCompletion.create(model=GPT_MODEL, messages=self.messages)
        response_message = response.choices[0].message
        self.messages.append(response_message)
        return Markdown(response_message.content)



def load_ipython_extension(ipython):
    #Set api key.
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key is None:
        openai_api_key = input("Please enter your OpenAI API key.")
    openai.api_key = openai_api_key        
    # ipython_instance = ipython
    pandora = Pandora(ipython)
    ipython.register_magics(pandora)