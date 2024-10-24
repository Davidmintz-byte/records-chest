"""Add artwork field

Revision ID: b025437929d8
Revises: 2fc8e3aca16b
Create Date: 2024-10-23 13:21:46.958351

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b025437929d8'
down_revision = '2fc8e3aca16b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('album', schema=None) as batch_op:
        batch_op.add_column(sa.Column('artwork', sa.String(length=500), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('album', schema=None) as batch_op:
        batch_op.drop_column('artwork')

    # ### end Alembic commands ###
