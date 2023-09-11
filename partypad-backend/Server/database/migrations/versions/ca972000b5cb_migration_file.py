"""migration file

Revision ID: ca972000b5cb
Revises: 
Create Date: 2022-11-26 22:48:01.605551

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ca972000b5cb'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('bookmark',
    sa.Column('venue_id', sa.Integer(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('bookmark_id', sa.Integer(), autoincrement=True, nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['ryan.user.user_id'], ),
    sa.ForeignKeyConstraint(['venue_id'], ['ryan.venue.venue_id'], ),
    sa.PrimaryKeyConstraint('bookmark_id'),
    schema='ryan'
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('bookmark', schema='ryan')
    # ### end Alembic commands ###
