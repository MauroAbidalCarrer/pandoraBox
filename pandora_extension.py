from IPython.core.magic import Magics, magics_class, line_cell_magic, line_magic, cell_magic, line_cell_magic, register_line_magic, register_cell_magic
from IPython import get_ipython
import openai
import os
from pprint import pprint
from IPython.display import Markdown
import json

GPT_MODEL = "gpt-3.5-turbo-0613"


CODE_PARAM = 'write_code_to_cell'
FUNCTIONS = [
    {
        "name": "write_to_notebook",
        "description": "Write new code cell to the notebook and communicate to user",
        "parameters": {
            "type": "object",
            "properties": {
                "msg_to_user": {"type": "string", "description": "msg to communicate to user, explain code, explain error"},
                CODE_PARAM: {"type": "string", "description": "new code cell content that is meant to be executed"},
            },
            # "required": ["msg_to_user"]
        }
    }
]

@magics_class
class Pandora(Magics):

    def __init__(self, shell):
        super(Pandora, self).__init__(shell)
        self.conversation = []
        self.messages = [ {"role": "system", "content": "You are an assistant in a notebook environment."}]

    @line_cell_magic
    def chat(self, line,cell=None):
        #Retrieve user msg
        user_msg_content = line if cell is None else cell

        # Update chat
        self.messages.append({"role": "user", "content": user_msg_content})         
        response_completion = openai.ChatCompletion.create(
            model=GPT_MODEL,
            messages=self.messages,
            functions=FUNCTIONS,
            function_call={"name": "write_to_notebook"}
            )
        response_msg = response_completion.choices[0].message
        self.messages.append(response_msg)

        # Parse assistant's message
        str_arguments = response_msg.function_call.arguments
        str_arguments.replace('\\n', '\n')
        json_args = json.loads(str_arguments)
        
        new_code_cell= json_args.get(CODE_PARAM)
        if new_code_cell is not None:
            new_cell_payload = dict(
                    source="set_next_input",
                    text=new_code_cell,
                    replace=False,
                )
            get_ipython().payload_manager.write_payload(new_cell_payload)

        msg_to_user = json_args.get("msg_to_user")
        if msg_to_user is not None:
            return Markdown(msg_to_user.replace('\n', '\n  '))



def load_ipython_extension(ipython):
    #Set api key.
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key is None:
        openai_api_key = input("Please enter your OpenAI API key.")
    openai.api_key = openai_api_key        
    # ipython_instance = ipython
    pandora = Pandora(ipython)
    ipython.register_magics(pandora)